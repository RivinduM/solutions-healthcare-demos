window.Config = {
  clientId: "",
  redirectUri: "http://localhost:3000",
  scope: "launch openid patient/DiagnosticReport.r",
  // Used as fallback if SMART discovery (.well-known/smart-configuration) fails
  // authorizationEndpoint: "https://api.asgardeo.io/t/wso2ob/oauth2/authorize",
  authorizationEndpoint: "https://localhost:9443/oauth2/authorize",
  tokenEndpoint: "https://localhost:9443/oauth2/token",
  fhirBaseUrl: "http://localhost:9090/fhir/r4",
};
