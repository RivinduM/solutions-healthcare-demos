/**
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Chip,
  Container,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LaunchScreen from "./components/LaunchScreen";
import ReportCard from "./components/ReportCard";
import DevConsole, { FlowEntry } from "./components/DevConsole";
import { DiagnosticReport } from "./types";
import { generatePKCE, generateState } from "./utils/pkce";
import {
  discoverSmartConfiguration,
  exchangeCodeForToken,
  parseJwtPayload,
} from "./utils/smart";

declare global {
  interface Window {
    Config: {
      clientId: string;
      redirectUri: string;
      scope: string;
      authorizationEndpoint: string;
      tokenEndpoint: string;
    };
  }
}

type Phase = "loading" | "launch" | "fetching" | "ready";

const SK_LAUNCH_ID = "smart_launch_id";
const SK_ISS = "smart_iss";
const SK_STATE = "smart_state";
const SK_CODE_VERIFIER = "smart_code_verifier";
const SK_TOKEN_ENDPOINT = "smart_token_endpoint";
const SK_FLOW_LOG = "smart_flow_log";

async function fetchDiagnosticReports(
  iss: string,
  patientId: string,
  accessToken: string
): Promise<{ reports: DiagnosticReport[]; bundle: unknown; url: string }> {
  const issPath = new URL(iss).pathname;
  const url = `${issPath}/DiagnosticReport?patient=${patientId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch diagnostic reports");
  const bundle = await res.json();
  const reports = ((bundle.entry ?? []) as Array<{ resource?: DiagnosticReport }>)
    .map((e) => e.resource)
    .filter((r): r is DiagnosticReport => Boolean(r));
  return { reports, bundle, url };
}

function loadFlowLog(): FlowEntry[] {
  try {
    return JSON.parse(sessionStorage.getItem(SK_FLOW_LOG) ?? "[]");
  } catch {
    return [];
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [patientId, setPatientId] = useState("");
  const [launchId, setLaunchId] = useState("");
  const [fhirServer, setFhirServer] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [flowEntries, setFlowEntries] = useState<FlowEntry[]>(loadFlowLog);
  const initialized = useRef(false);

  const addEntry = (entry: Omit<FlowEntry, "id">) => {
    const existing = loadFlowLog();
    const newEntry: FlowEntry = { ...entry, id: existing.length + 1 };
    const updated = [...existing, newEntry];
    sessionStorage.setItem(SK_FLOW_LOG, JSON.stringify(updated));
    setFlowEntries(updated);
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const launchId = params.get("launch");
    const iss = params.get("iss");

    if (code && state) {
      handleAuthCallback(code, state);
    } else if (launchId && iss) {
      handleSmartLaunch(launchId, decodeURIComponent(iss));
    } else {
      setPhase("launch");
    }
  }, []);

  const handleSmartLaunch = (id: string, iss: string) => {
    sessionStorage.removeItem(SK_FLOW_LOG);
    setFlowEntries([]);
    sessionStorage.setItem(SK_LAUNCH_ID, id);
    sessionStorage.setItem(SK_ISS, iss);
    setLaunchId(id);
    setFhirServer(iss);
    setPhase("launch");
  };

  const handleAuthorize = async () => {
    setIsDiscovering(true);
    setFetchError("");

    // Clear log and start a fresh flow
    sessionStorage.removeItem(SK_FLOW_LOG);
    setFlowEntries([]);

    try {
      const iss = sessionStorage.getItem(SK_ISS) ?? "";
      const storedLaunchId = sessionStorage.getItem(SK_LAUNCH_ID) ?? "";

      let authEndpoint = window.Config.authorizationEndpoint;
      let tokenEndpoint = window.Config.tokenEndpoint;

      if (iss) {
        const discoveryUrl = `${iss}/.well-known/smart-configuration`;
        const discovered = await discoverSmartConfiguration(iss);
        if (discovered) {
          authEndpoint = discovered.authorization_endpoint;
          tokenEndpoint = discovered.token_endpoint;
        }
        addEntry({
          label: "SMART Discovery",
          timestamp: new Date().toISOString(),
          request: { method: "GET", url: discoveryUrl },
          response: discovered
            ? { status: 200, body: JSON.stringify(discovered, null, 2) }
            : {
                status: 404,
                body: "Discovery not available — using configured endpoints.",
                isError: false,
              },
        });
      }

      if (!authEndpoint) {
        setFetchError(
          "Could not determine authorization endpoint. Configure authorizationEndpoint in config.js."
        );
        setIsDiscovering(false);
        return;
      }

      sessionStorage.setItem(SK_TOKEN_ENDPOINT, tokenEndpoint);

      const { codeVerifier, codeChallenge } = await generatePKCE();
      const state = generateState();
      sessionStorage.setItem(SK_CODE_VERIFIER, codeVerifier);
      sessionStorage.setItem(SK_STATE, state);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: window.Config.clientId,
        redirect_uri: window.Config.redirectUri,
        scope: window.Config.scope,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });
      if (storedLaunchId) params.set("launch", storedLaunchId);
      if (iss) params.set("aud", iss);

      const authUrl = `${authEndpoint}?${params.toString()}`;
      addEntry({
        label: "Authorization Redirect",
        timestamp: new Date().toISOString(),
        request: {
          method: "GET",
          url: authUrl,
          body: JSON.stringify(
            {
              response_type: "code",
              client_id: window.Config.clientId,
              redirect_uri: window.Config.redirectUri,
              scope: window.Config.scope,
              code_challenge_method: "S256",
              ...(storedLaunchId ? { launch: storedLaunchId } : {}),
              ...(iss ? { aud: iss } : {}),
            },
            null,
            2
          ),
        },
        response: { body: "Redirecting to authorization server..." },
      });

      window.location.href = authUrl;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Authorization failed.";
      setFetchError(msg);
      setIsDiscovering(false);
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    setPhase("fetching");
    try {
      const savedState = sessionStorage.getItem(SK_STATE);
      if (state !== savedState) throw new Error("State mismatch — possible CSRF.");

      const codeVerifier = sessionStorage.getItem(SK_CODE_VERIFIER) ?? "";
      const tokenEndpoint =
        sessionStorage.getItem(SK_TOKEN_ENDPOINT) ?? window.Config.tokenEndpoint;
      const iss = sessionStorage.getItem(SK_ISS) ?? "";

      const tokenRes = await exchangeCodeForToken(
        tokenEndpoint,
        code,
        codeVerifier,
        window.Config.clientId,
        window.Config.redirectUri
      );

      const jwtPayload = parseJwtPayload(tokenRes.access_token);

      addEntry({
        label: "Token Exchange",
        timestamp: new Date().toISOString(),
        request: {
          method: "POST",
          url: tokenEndpoint,
          body: JSON.stringify(
            {
              grant_type: "authorization_code",
              code: code.slice(0, 12) + "…",
              redirect_uri: window.Config.redirectUri,
              client_id: window.Config.clientId,
              code_verifier: "[PKCE verifier]",
            },
            null,
            2
          ),
        },
        response: {
          status: 200,
          body: JSON.stringify(
            {
              token_type: tokenRes.token_type,
              expires_in: tokenRes.expires_in,
              scope: tokenRes.scope,
              access_token: tokenRes.access_token,
            },
            null,
            2
          ),
        },
        decodedPayload: JSON.stringify(jwtPayload, null, 2),
      });
      const patient = jwtPayload.patient as string;
      setPatientId(patient);

      window.history.replaceState({}, "", window.location.pathname);

      const { reports: data, bundle, url } = await fetchDiagnosticReports(
        iss,
        patient,
        tokenRes.access_token
      );

      addEntry({
        label: "Fetch DiagnosticReports",
        timestamp: new Date().toISOString(),
        request: {
          method: "GET",
          url,
          body: JSON.stringify({ Authorization: "Bearer [access_token]" }, null, 2),
        },
        response: {
          status: 200,
          body: JSON.stringify(bundle, null, 2),
        },
      });

      setReports(data);
      setPhase("ready");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Authorization callback failed.";
      addEntry({
        label: "Error",
        timestamp: new Date().toISOString(),
        request: { method: "—", url: "—" },
        response: { body: msg, isError: true },
      });
      setFetchError(msg);
      setPhase("ready");
    }
  };

  const mainContent = (() => {
    if (phase === "loading" || phase === "fetching") {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">
            {phase === "fetching" ? "Loading diagnostic reports..." : "Initializing..."}
          </Typography>
        </Box>
      );
    }

    if (phase === "launch") {
      return (
        <LaunchScreen
          patientId={patientId}
          launchId={launchId}
          fhirServer={fhirServer}
          isDiscovering={isDiscovering}
          error={fetchError}
          onAuthorize={handleAuthorize}
        />
      );
    }

    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <AppBar position="static" color="primary" elevation={1}>
          <Toolbar>
            <LocalHospitalIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
              Diagnostic Reports Viewer
            </Typography>
            {patientId && (
              <Chip
                icon={<PersonIcon />}
                label={`Patient: ${patientId}`}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "& .MuiChip-icon": { color: "white" },
                  mr: 1,
                }}
              />
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {fetchError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {fetchError}
            </Alert>
          )}

          {!fetchError && reports.length === 0 && (
            <Alert severity="info">No diagnostic reports found for this patient.</Alert>
          )}

          {reports.length > 0 && (
            <>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {reports.length} Report{reports.length !== 1 ? "s" : ""} Found
              </Typography>
              <Grid container spacing={2}>
                {reports.map((report) => (
                  <Grid item xs={12} md={6} lg={4} key={report.id}>
                    <ReportCard report={report} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>
      </Box>
    );
  })();

  return (
    <>
      {mainContent}
      <DevConsole entries={flowEntries} />
    </>
  );
}
