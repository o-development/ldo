import type {
  DereferencableIdClientDetails,
  DynamicRegistrationClientDetails,
} from "@uvdsl/solid-oidc-client-browser/core";

/**
 * The OIDC `prompt` sent when signing up.
 *
 * - `create` asks the identity provider to show its registration screen
 *   instead of the login screen (OpenID Connect "Initiating User
 *   Registration via OpenID Connect").
 * - `consent` must stay: the Community Solid Server only issues a refresh
 *   token when it is present.
 */
export const SIGN_UP_PROMPT = "consent create";

/**
 * Redirects the user to their identity provider's registration flow.
 *
 * `@uvdsl/solid-oidc-client-browser` hard-codes `prompt=consent` in
 * `Session.login`, so it cannot start a sign-up. This performs the same
 * authorization-code + PKCE redirect with a different `prompt`, and stores the
 * same `sessionStorage` entries that the library's
 * `Session.handleRedirectFromLogin()` reads when the user comes back. The
 * library then completes the login unchanged.
 *
 * Keep this in step with `redirectForLogin` in the library; the
 * `redirectForSignUp` tests round-trip through the real
 * `handleRedirectFromLogin()` to catch drift.
 */
export async function redirectForSignUp(
  idp: string,
  redirect_uri: string,
  client_details?:
    | DereferencableIdClientDetails
    | DynamicRegistrationClientDetails,
  navigate: (url: string) => void = (url) => {
    window.location.href = url;
  },
): Promise<void> {
  // RFC 6749 §3.1.2: the redirect_uri must not carry a fragment.
  const redirectUrl = new URL(redirect_uri);
  const sanitizedRedirectUri =
    redirectUrl.origin + redirectUrl.pathname + redirectUrl.search;

  const openidConfiguration = await fetchJson(
    `${new URL(idp).origin}/.well-known/openid-configuration`,
  );

  // RFC 9207: the issuer must match the identity provider (modulo a trailing
  // slash).
  const issuer: string = openidConfiguration.issuer;
  if (trimTrailingSlash(idp) !== trimTrailingSlash(issuer)) {
    throw new Error(`RFC 9207 - iss !== idp - ${issuer} !== ${idp}`);
  }
  sessionStorage.setItem("idp", issuer);
  sessionStorage.setItem("token_endpoint", openidConfiguration.token_endpoint);
  sessionStorage.setItem("jwks_uri", openidConfiguration.jwks_uri);

  let clientId =
    client_details && "client_id" in client_details
      ? client_details.client_id
      : undefined;
  if (!clientId) {
    const registration = await fetchJson(
      openidConfiguration.registration_endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(client_details ?? { redirect_uris: [sanitizedRedirectUri] }),
          grant_types: ["authorization_code", "refresh_token"],
          token_endpoint_auth_method: "none",
          application_type: "web",
          subject_type: "public",
        }),
      },
    );
    clientId = registration.client_id as string;
  }
  // A client_id that is a URL (a Client ID Document) is not remembered; the
  // library reads it from the session's clientDetails instead.
  if (!isUrl(clientId)) {
    sessionStorage.setItem("client_id", clientId);
  }

  // RFC 7636 PKCE
  const codeVerifier = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  sessionStorage.setItem("pkce_code_verifier", codeVerifier);
  const codeChallenge = await sha256Base64Url(codeVerifier);

  // RFC 6749 CSRF protection
  const state = crypto.randomUUID();
  sessionStorage.setItem("csrf_token", state);

  const authorizationUrl = new URL(openidConfiguration.authorization_endpoint);
  const params = authorizationUrl.searchParams;
  params.set("response_type", "code");
  params.set("redirect_uri", sanitizedRedirectUri);
  params.set("scope", "openid offline_access webid");
  params.set("client_id", clientId);
  params.set("code_challenge_method", "S256");
  params.set("code_challenge", codeChallenge);
  params.set("state", state);
  params.set("prompt", SIGN_UP_PROMPT);
  navigate(authorizationUrl.toString());
}

async function fetchJson(input: string, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
  return btoa(String.fromCharCode(...digest))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
