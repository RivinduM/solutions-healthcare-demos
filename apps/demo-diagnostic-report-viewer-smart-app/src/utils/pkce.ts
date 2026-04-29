function base64urlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const array = crypto.getRandomValues(new Uint8Array(32));
  const codeVerifier = base64urlEncode(array.buffer);
  const encoded = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const codeChallenge = base64urlEncode(digest);
  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  const array = crypto.getRandomValues(new Uint8Array(16));
  return base64urlEncode(array.buffer);
}
