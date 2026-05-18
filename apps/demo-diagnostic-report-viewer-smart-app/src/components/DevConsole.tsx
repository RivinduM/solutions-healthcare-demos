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
const HANDLE_BG = "#37474f";
const HANDLE_HOVER = "#607d8b";

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

function startHorizDrag(
  e: React.MouseEvent,
  currentWidth: number,
  setter: React.Dispatch<React.SetStateAction<number>> | ((w: number) => void),
  invert = false
) {
  e.preventDefault();
  const startX = e.clientX;
  const onMove = (ev: MouseEvent) => {
    const delta = ev.clientX - startX;
    const next = Math.max(80, invert ? currentWidth - delta : currentWidth + delta);
    (setter as (w: number) => void)(next);
  };
  const onUp = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function startVertDrag(
  e: React.MouseEvent,
  currentHeight: number,
  setter: React.Dispatch<React.SetStateAction<number>>
) {
  e.preventDefault();
  const startY = e.clientY;
  const onMove = (ev: MouseEvent) => {
    setter(Math.max(100, currentHeight + ev.clientY - startY));
  };
  const onUp = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

interface EntryDetailProps {
  entry: FlowEntry;
  col1Width: number;
  col2Width: number;
  detailHeight: number;
  onCol1Resize: (e: React.MouseEvent) => void;
  onCol2Resize: (e: React.MouseEvent) => void;
  onVertResize: (e: React.MouseEvent) => void;
}

function EntryDetail({
  entry,
  col1Width,
  col2Width,
  detailHeight,
  onCol1Resize,
  onCol2Resize,
  onVertResize,
}: EntryDetailProps) {
  const hasDecoded = Boolean(entry.decodedPayload || entry.decodedIdToken);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${BORDER}` }}>
      <Box sx={{ display: "flex", height: detailHeight }}>
        {/* Column 1 — Request */}
        <Box sx={{ width: col1Width, flexShrink: 0, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Typography sx={{ color: "#90a4ae", fontFamily: "monospace", fontSize: 10, px: 1.5, py: 0.5, borderBottom: `1px solid ${BORDER}`, backgroundColor: TAB_BG, flexShrink: 0 }}>
            Request
          </Typography>
          <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, backgroundColor: CODE_BG }}>
            <pre style={{ margin: 0, color: "#cdd3de", fontSize: 10, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6 }}>
              {formatRequest(entry.request)}
            </pre>
          </Box>
        </Box>

        {/* Horizontal resize handle 1 */}
        <Box
          onMouseDown={onCol1Resize}
          sx={{ width: 4, flexShrink: 0, cursor: "col-resize", backgroundColor: HANDLE_BG, "&:hover": { backgroundColor: HANDLE_HOVER }, zIndex: 1 }}
        />

        {/* Column 2 — Response */}
        <Box sx={{ width: col2Width, flexShrink: 0, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Typography sx={{ color: "#90a4ae", fontFamily: "monospace", fontSize: 10, px: 1.5, py: 0.5, borderBottom: `1px solid ${BORDER}`, backgroundColor: TAB_BG, flexShrink: 0 }}>
            Response
          </Typography>
          <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, backgroundColor: CODE_BG }}>
            <pre style={{ margin: 0, color: entry.response?.isError ? "#ef9a9a" : "#cdd3de", fontSize: 10, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6 }}>
              {entry.response?.body ?? "—"}
            </pre>
          </Box>
        </Box>

        {/* Horizontal resize handle 2 — only when decoded column exists */}
        {hasDecoded && (
          <Box
            onMouseDown={onCol2Resize}
            sx={{ width: 4, flexShrink: 0, cursor: "col-resize", backgroundColor: HANDLE_BG, "&:hover": { backgroundColor: HANDLE_HOVER }, zIndex: 1 }}
          />
        )}

        {/* Column 3 — Decoded Tokens */}
        {hasDecoded && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Typography sx={{ color: "#90a4ae", fontFamily: "monospace", fontSize: 10, px: 1.5, py: 0.5, borderBottom: `1px solid ${BORDER}`, backgroundColor: TAB_BG, flexShrink: 0 }}>
              Decoded Tokens
            </Typography>
            <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, backgroundColor: CODE_BG }}>
              {entry.decodedPayload && (
                <>
                  <Typography sx={{ color: "#90a4ae", fontFamily: "monospace", fontSize: 9, mb: 0.5 }}>// access_token</Typography>
                  <pre style={{ margin: 0, marginBottom: entry.decodedIdToken ? 12 : 0, color: "#a5d6a7", fontSize: 10, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6 }}>
                    {entry.decodedPayload}
                  </pre>
                </>
              )}
              {entry.decodedIdToken && (
                <>
                  <Typography sx={{ color: "#90a4ae", fontFamily: "monospace", fontSize: 9, mb: 0.5 }}>// id_token</Typography>
                  <pre style={{ margin: 0, color: "#80cbc4", fontSize: 10, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6 }}>
                    {entry.decodedIdToken}
                  </pre>
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Vertical resize handle */}
      <Box
        onMouseDown={onVertResize}
        sx={{ height: 5, cursor: "row-resize", backgroundColor: HANDLE_BG, flexShrink: 0, "&:hover": { backgroundColor: HANDLE_HOVER } }}
      />
    </Box>
  );
}

export default function DevConsole({ entries }: DevConsoleProps) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState(680);
  const [col1Width, setCol1Width] = useState(210);
  const [col2Width, setCol2Width] = useState(210);
  const [detailHeight, setDetailHeight] = useState(280);

  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

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
        userSelect: "none",
      }}
    >
      {/* Expanded panel */}
      {open && (
        <Box
          sx={{
            width: panelWidth,
            minWidth: 320,
            backgroundColor: PANEL_BG,
            display: "flex",
            flexDirection: "column",
            pointerEvents: "all",
            boxShadow: "-4px 0 16px rgba(0,0,0,0.35)",
            position: "relative",
          }}
        >
          {/* Left-edge panel resize handle */}
          <Box
            onMouseDown={(e) => startHorizDrag(e, panelWidth, (w: number) => setPanelWidth(w), true)}
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 5,
              height: "100%",
              cursor: "col-resize",
              backgroundColor: "transparent",
              "&:hover": { backgroundColor: HANDLE_HOVER },
              zIndex: 10,
            }}
          />
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
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: "#eceff1", fontFamily: "monospace", fontSize: 13, letterSpacing: 1.5, fontWeight: 700 }}>
              Developer Console
            </Typography>
            <Typography sx={{ color: "#90a4ae", fontFamily: "monospace", fontSize: 11 }}>
              {entries.length} flow{entries.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          {/* Accordion list */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {entries.length === 0 ? (
              <Typography sx={{ color: "#90a4ae", textAlign: "center", mt: 3, mb: 3, fontSize: 12, fontFamily: "monospace" }}>
                No flows captured yet.
              </Typography>
            ) : (
              entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                return (
                  <Box key={entry.id} sx={{ borderBottom: `1px solid ${BORDER}` }}>
                    {/* Row header */}
                    <Box
                      onClick={() => toggle(entry.id)}
                      sx={{
                        px: 1.5,
                        py: 0.8,
                        cursor: "pointer",
                        backgroundColor: isExpanded ? "#37474f" : "transparent",
                        "&:hover": { backgroundColor: "#3d5360" },
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ color: "#78909c", fontFamily: "monospace", fontSize: 10, flexShrink: 0 }}>
                        {isExpanded ? "▾" : "▸"}
                      </Typography>
                      <Chip
                        label={entry.request.method}
                        size="small"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: 9,
                          height: 18,
                          flexShrink: 0,
                          backgroundColor: entry.request.method === "POST" ? "#bf360c" : "#1565c0",
                          color: "white",
                        }}
                      />
                      <Typography sx={{ color: "#eceff1", fontSize: 12, fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.label}
                      </Typography>
                      <Typography sx={{ color: "#78909c", fontSize: 10, fontFamily: "monospace", flexShrink: 0 }}>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </Typography>
                      {entry.response != null && (
                        <Chip
                          label={entry.response.status != null ? entry.response.status : entry.response.isError ? "ERR" : "OK"}
                          size="small"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: 9,
                            height: 18,
                            flexShrink: 0,
                            backgroundColor: entry.response.isError ? "#b71c1c" : "#1b5e20",
                            color: "white",
                          }}
                        />
                      )}
                    </Box>

                    {/* Inline detail — expands under the heading */}
                    {isExpanded && (
                      <EntryDetail
                        entry={entry}
                        col1Width={col1Width}
                        col2Width={col2Width}
                        detailHeight={detailHeight}
                        onCol1Resize={(e) => startHorizDrag(e, col1Width, setCol1Width)}
                        onCol2Resize={(e) => startHorizDrag(e, col2Width, setCol2Width)}
                        onVertResize={(e) => startVertDrag(e, detailHeight, setDetailHeight)}
                      />
                    )}
                  </Box>
                );
              })
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
