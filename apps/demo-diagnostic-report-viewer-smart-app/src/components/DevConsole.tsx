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

import { useState } from "react";
import { Box, Typography, Chip } from "@mui/material";

export interface FlowEntry {
  id: number;
  label: string;
  timestamp: string;
  request: {
    method: string;
    url: string;
    body?: string;
  };
  response?: {
    status?: number;
    body: string;
    isError?: boolean;
  };
  decodedPayload?: string;
  decodedIdToken?: string;
}

interface DevConsoleProps {
  entries: FlowEntry[];
}

const CODE_BG = "#1a2332";
const PANEL_BG = "#546e7a";
const TAB_BG = "#455a64";
const BORDER = "#37474f";

export default function DevConsole({ entries }: DevConsoleProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected =
    selectedId != null
      ? (entries.find((e) => e.id === selectedId) ?? entries.at(-1) ?? null)
      : (entries.at(-1) ?? null);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        zIndex: 1300,
        pointerEvents: "none",
      }}
    >
      {/* Expanded panel */}
      {open && (
        <Box
          sx={{
            width: 640,
            backgroundColor: PANEL_BG,
            display: "flex",
            flexDirection: "column",
            pointerEvents: "all",
            boxShadow: "-4px 0 16px rgba(0,0,0,0.35)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.2,
              backgroundColor: TAB_BG,
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                color: "#eceff1",
                fontFamily: "monospace",
                fontSize: 13,
                letterSpacing: 1.5,
                fontWeight: 700,
              }}
            >
              Developer Console
            </Typography>
            <Typography
              sx={{
                color: "#90a4ae",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              {entries.length} flow{entries.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          {/* Flow list */}
          <Box
            sx={{
              maxHeight: "32%",
              overflowY: "auto",
              borderBottom: `2px solid ${BORDER}`,
            }}
          >
            {entries.length === 0 ? (
              <Typography
                sx={{
                  color: "#90a4ae",
                  textAlign: "center",
                  mt: 3,
                  mb: 3,
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              >
                No flows captured yet.
              </Typography>
            ) : (
              entries.map((entry) => {
                const isSelected =
                  selectedId === entry.id ||
                  (selectedId == null && entry.id === entries.at(-1)?.id);
                return (
                  <Box
                    key={entry.id}
                    onClick={() => setSelectedId(entry.id)}
                    sx={{
                      px: 1.5,
                      py: 0.7,
                      cursor: "pointer",
                      borderBottom: `1px solid ${BORDER}`,
                      backgroundColor: isSelected ? "#37474f" : "transparent",
                      "&:hover": { backgroundColor: "#3d5360" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={entry.request.method}
                      size="small"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: 9,
                        height: 18,
                        flexShrink: 0,
                        backgroundColor:
                          entry.request.method === "POST" ? "#bf360c" : "#1565c0",
                        color: "white",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#eceff1",
                        fontSize: 12,
                        fontFamily: "monospace",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#78909c",
                        fontSize: 10,
                        fontFamily: "monospace",
                        flexShrink: 0,
                      }}
                    >
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </Typography>
                    {entry.response != null && (
                      <Chip
                        label={
                          entry.response.status != null
                            ? entry.response.status
                            : entry.response.isError
                            ? "ERR"
                            : "OK"
                        }
                        size="small"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: 9,
                          height: 18,
                          flexShrink: 0,
                          backgroundColor: entry.response.isError
                            ? "#b71c1c"
                            : "#1b5e20",
                          color: "white",
                        }}
                      />
                    )}
                  </Box>
                );
              })
            )}
          </Box>

          {/* Request / Response / Decoded panes */}
          <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
            {/* Request */}
            <Box
              sx={{
                flex: 1,
                borderRight: `1px solid ${BORDER}`,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  color: "#90a4ae",
                  fontFamily: "monospace",
                  fontSize: 11,
                  px: 1.5,
                  py: 0.6,
                  borderBottom: `1px solid ${BORDER}`,
                  backgroundColor: TAB_BG,
                  flexShrink: 0,
                }}
              >
                Request Body
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, backgroundColor: CODE_BG }}>
                <pre
                  style={{
                    margin: 0,
                    color: "#cdd3de",
                    fontSize: 11,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    lineHeight: 1.65,
                  }}
                >
                  {selected ? formatRequest(selected.request) : ""}
                </pre>
              </Box>
            </Box>

            {/* Response */}
            <Box
              sx={{
                flex: 1,
                borderRight: (selected?.decodedPayload || selected?.decodedIdToken) ? `1px solid ${BORDER}` : "none",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  color: "#90a4ae",
                  fontFamily: "monospace",
                  fontSize: 11,
                  px: 1.5,
                  py: 0.6,
                  borderBottom: `1px solid ${BORDER}`,
                  backgroundColor: TAB_BG,
                  flexShrink: 0,
                }}
              >
                Response Body
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, backgroundColor: CODE_BG }}>
                <pre
                  style={{
                    margin: 0,
                    color: selected?.response?.isError ? "#ef9a9a" : "#cdd3de",
                    fontSize: 11,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    lineHeight: 1.65,
                  }}
                >
                  {selected?.response?.body ?? "—"}
                </pre>
              </Box>
            </Box>

            {/* Decoded Tokens — only when present */}
            {(selected?.decodedPayload || selected?.decodedIdToken) && (
              <Box
                sx={{
                  flex: 1,
                  borderLeft: `1px solid ${BORDER}`,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    color: "#90a4ae",
                    fontFamily: "monospace",
                    fontSize: 11,
                    px: 1.5,
                    py: 0.6,
                    borderBottom: `1px solid ${BORDER}`,
                    backgroundColor: TAB_BG,
                    flexShrink: 0,
                  }}
                >
                  Decoded Tokens
                </Typography>
                <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, backgroundColor: CODE_BG }}>
                  {selected.decodedPayload && (
                    <>
                      <Typography sx={{ color: "#90a4ae", fontFamily: "monospace", fontSize: 10, mb: 0.5 }}>
                        // access_token
                      </Typography>
                      <pre
                        style={{
                          margin: 0,
                          marginBottom: selected.decodedIdToken ? 16 : 0,
                          color: "#a5d6a7",
                          fontSize: 11,
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          lineHeight: 1.65,
                        }}
                      >
                        {selected.decodedPayload}
                      </pre>
                    </>
                  )}
                  {selected.decodedIdToken && (
                    <>
                      <Typography sx={{ color: "#90a4ae", fontFamily: "monospace", fontSize: 10, mb: 0.5 }}>
                        // id_token
                      </Typography>
                      <pre
                        style={{
                          margin: 0,
                          color: "#80cbc4",
                          fontSize: 11,
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          lineHeight: 1.65,
                        }}
                      >
                        {selected.decodedIdToken}
                      </pre>
                    </>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Tab handle */}
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          width: 34,
          backgroundColor: open ? BORDER : TAB_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          pointerEvents: "all",
          borderLeft: `1px solid ${BORDER}`,
          "&:hover": { backgroundColor: BORDER },
          transition: "background-color 0.15s",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            color: "#cfd8dc",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2.5,
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            userSelect: "none",
            fontFamily: "monospace",
          }}
        >
          DEVELOPER CONSOLE
        </Typography>
      </Box>
    </Box>
  );
}

function formatRequest(req: FlowEntry["request"]): string {
  const lines: string[] = [`${req.method} ${req.url}`];
  if (req.body) {
    lines.push("");
    try {
      lines.push(JSON.stringify(JSON.parse(req.body), null, 2));
    } catch {
      lines.push(req.body);
    }
  }
  return lines.join("\n");
}
