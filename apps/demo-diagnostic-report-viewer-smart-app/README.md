# Demo Diagnostic Report Viewer SMART App

A SMART on FHIR application that demonstrates the EHR Launch flow. Once authorized, it fetches and displays DiagnosticReports for the launched patient context. It includes a built-in **Developer Console** that captures each step of the authorization flow with request and response details.

---

## Features

- **SMART on FHIR EHR Launch** — receives `launch` and `iss` parameters from the EHR
- **PKCE Authorization Code Flow** — secure token exchange with SHA-256 code challenge
- **SMART Discovery** — auto-discovers authorization and token endpoints via `/.well-known/smart-configuration`
- **Patient resolution from JWT** — extracts the `patient` claim directly from the access token
- **DiagnosticReport viewer** — displays reports with category, status, conclusion, and results
- **Developer Console** — collapsible side panel showing SMART Discovery → Authorization Redirect → Token Exchange → FHIR fetch flows with full request/response and decoded JWT payload

---

## Prerequisites

| Service | Default URL |
|---|---|
| FHIR Server | `http://localhost:9090` |
| SMART Launch Service | `http://localhost:9092` |
| WSO2 Identity Server/Asgardeo | `https://localhost:9443` |
| Demo EHR App | `http://localhost:5173` |

---

## Configuration

Runtime configuration is loaded from `public/config.js` before the React app initializes. Edit this file to match your environment — no rebuild required.

```js
window.Config = {
  clientId: "<oauth2-client-id>",
  redirectUri: "http://localhost:3000",
  scope: "launch openid patient/DiagnosticReport.read",

  // Fallback endpoints used when SMART discovery is unavailable
  authorizationEndpoint: "https://localhost:9443/oauth2/authorize",
  tokenEndpoint: "https://localhost:9443/oauth2/token",
};
```

| Field | Description |
|---|---|
| `clientId` | OAuth2 client ID registered in the authorization server |
| `redirectUri` | Must match the redirect URI registered with the client |
| `scope` | Space-separated SMART scopes |
| `authorizationEndpoint` | Fallback authorization endpoint |
| `tokenEndpoint` | Fallback token endpoint |

### FHIR Server Proxy (Development)

During development, requests to `/fhir/*` are proxied to `http://localhost:9090` by Vite to avoid CORS issues. This is configured in `vite.config.ts`:

```ts
proxy: {
  "/fhir": {
    target: "http://localhost:9090",
    changeOrigin: true,
  },
}
```

---

## Getting Started

```bash
npm install
npm run dev
```

The app runs at **http://localhost:3000**.

---

## Launch Flows

### EHR Launch (standard)

The EHR app opens the smart app with launch parameters:

```
http://localhost:3000?launch=<launchId>&iss=<fhirServerUrl>
```

The app:
1. Stores `launchId` and `iss` from URL params
2. Shows the **Authorize** screen with launch context
3. On authorize, performs SMART discovery against the `iss` URL
4. Redirects to the authorization server with PKCE and the `launch` parameter
5. Exchanges the returned code for an access token
6. Extracts the `patient` claim from the JWT access token
7. Fetches `DiagnosticReport?patient=<id>` from the FHIR server
8. Displays the reports

### Standalone Launch

Navigating directly to `http://localhost:3000` (no URL params) shows the Authorize screen without launch context. Clicking **Authorize** starts the PKCE flow without a `launch` parameter.

### Manual Launch ID Entry

If the app cannot resolve the launch from URL params, a login screen allows manual entry of a `launchId`.

---

## Developer Console

Click the **DEVELOPER CONSOLE** tab on the right edge of the screen to open the console panel. It captures the following flow steps:

| Step | Details |
|---|---|
| SMART Discovery | GET `{iss}/.well-known/smart-configuration` |
| Authorization Redirect | GET to the authorization endpoint with all PKCE and SMART params |
| Token Exchange | POST to the token endpoint; response includes the full access token and decoded JWT payload |
| Fetch DiagnosticReports | GET `{fhirServer}/DiagnosticReport?patient={id}`; response shows the full FHIR Bundle |

Flow entries persist across the authorization redirect via `sessionStorage` and are cleared at the start of each new authorization flow.

---

## Project Structure

```
demo-diagnostic-report-viewer-smart-app/
├── public/
│   ├── config.js            # Runtime configuration (edit per environment)
│   └── index.html
├── src/
│   ├── components/
│   │   ├── DevConsole.tsx   # Collapsible developer console panel
│   │   ├── LaunchScreen.tsx # Authorize screen shown before login
│   │   ├── LoginScreen.tsx  # Manual launch ID entry screen
│   │   └── ReportCard.tsx   # DiagnosticReport display card
│   ├── utils/
│   │   ├── pkce.ts          # PKCE code verifier / challenge generation
│   │   └── smart.ts         # SMART discovery, token exchange, JWT decode
│   ├── types.ts             # FHIR and app type definitions
│   └── App.tsx              # Main app with phase-based routing and flow logging
└── vite.config.ts           # Vite config with FHIR proxy
```

---

## WSO2 Identity Server Setup

Register an OAuth2 application in WSO2 IS 7.x with:

- **Grant type**: Authorization Code
- **PKCE**: enabled, mandatory
- **Redirect URI**: `http://localhost:3000`
- **Allowed origins**: `http://localhost:3000`
- **Scopes**: `launch`, `openid`, `patient/DiagnosticReport.r`
