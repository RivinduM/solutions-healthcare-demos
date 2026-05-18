window.Config = {
  clientId: "",
  clientSecret: "",
  redirectUri: "http://localhost:3000",
  scope: "launch openid fhirUser patient/DiagnosticReport.s patient/Observation.s",
  // Used as fallback if SMART discovery (.well-known/smart-configuration) fails
  // authorizationEndpoint: "https://api.asgardeo.io/t/wso2ob/oauth2/authorize",
  authorizationEndpoint: "https://localhost:9453/oauth2/authorize",
  tokenEndpoint: "https://localhost:9453/oauth2/token",
  fhirBaseUrl: "https://localhost:8243/r4",
  diagnosticReportUrl: "/DiagnosticReport",
  observationUrl: "/Observation",
};
