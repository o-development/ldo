// @vitest-environment node
// jsdom hands out Uint8Arrays from a different realm than its TextEncoder,
// which breaks jose's `instanceof Uint8Array` checks inside the OIDC library.
// Node provides crypto and TextEncoder natively; the few browser globals the
// library touches are shimmed below.
import {
  calculateJwkThumbprint,
  decodeProtectedHeader,
  exportJWK,
  generateKeyPair,
  SignJWT,
} from "jose";
import type { JWK, KeyLike } from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionCore } from "@uvdsl/solid-oidc-client-browser/core";
import { redirectForSignUp, SIGN_UP_PROMPT } from "../src/redirectForSignUp";

const IDP = "https://idp.example/";
const APP = "https://app.example/app/callback";
const WEB_ID = "https://pod.example/profile/card#me";
const DYNAMIC_CLIENT_ID = "dynamic-client-123";

/**
 * A minimal Solid-OIDC identity provider: discovery, dynamic registration,
 * JWKS and a token endpoint that checks PKCE and issues a DPoP-bound access
 * token, the way the Community Solid Server does.
 */
async function createFakeIdp() {
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  const publicJwk: JWK = { ...(await exportJWK(publicKey)), alg: "ES256" };
  let codeChallenge: string | undefined;
  const requests: { url: string; init?: RequestInit }[] = [];

  const json = (body: unknown) =>
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
    });

  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      requests.push({ url, init });
      switch (url) {
        case "https://idp.example/.well-known/openid-configuration":
          return json({
            issuer: IDP,
            authorization_endpoint: "https://idp.example/.oidc/auth",
            token_endpoint: "https://idp.example/.oidc/token",
            jwks_uri: "https://idp.example/.oidc/jwks",
            registration_endpoint: "https://idp.example/.oidc/reg",
          });
        case "https://idp.example/.oidc/reg":
          return json({ client_id: DYNAMIC_CLIENT_ID });
        case "https://idp.example/.oidc/jwks":
          return json({ keys: [publicJwk] });
        case "https://idp.example/.oidc/token":
          return json(
            await issueToken(init!, codeChallenge!, privateKey as KeyLike),
          );
        default:
          return new Response("not found", { status: 404 });
      }
    },
  );

  return {
    fetchMock,
    requests,
    setCodeChallenge: (challenge: string) => {
      codeChallenge = challenge;
    },
  };
}

async function issueToken(
  init: RequestInit,
  codeChallenge: string,
  signingKey: KeyLike,
) {
  const body = new URLSearchParams(init.body as string);
  // PKCE: the verifier the library sends must hash to the challenge we sent.
  const digest = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(body.get("code_verifier")!),
    ),
  );
  const expectedChallenge = btoa(String.fromCharCode(...digest))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  if (expectedChallenge !== codeChallenge) {
    throw new Error("PKCE verifier does not match the challenge");
  }
  const dpopJwk = decodeProtectedHeader(
    (init.headers as Record<string, string>).dpop,
  ).jwk as JWK;
  const accessToken = await new SignJWT({
    webid: WEB_ID,
    client_id: body.get("client_id"),
    cnf: { jkt: await calculateJwkThumbprint(dpopJwk) },
  })
    .setProtectedHeader({ alg: "ES256" })
    .setIssuer(IDP)
    .setAudience("solid")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(signingKey);
  return {
    access_token: accessToken,
    refresh_token: "refresh-token",
    expires_in: 3600,
    token_type: "DPoP",
  };
}

/** The browser globals the sign-up redirect and the OIDC library use. */
function installBrowserGlobals() {
  const location = { href: "https://app.example/" };
  const setUrl = (_state: unknown, _title: string, url: string) => {
    location.href = new URL(url, location.href).toString();
  };
  const storage = new Map<string, string>();
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("location", location);
  vi.stubGlobal("history", { pushState: setUrl, replaceState: setUrl });
  vi.stubGlobal("document", { title: "" });
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  });
}

describe("redirectForSignUp", () => {
  let idp: Awaited<ReturnType<typeof createFakeIdp>>;

  beforeEach(async () => {
    installBrowserGlobals();
    idp = await createFakeIdp();
    vi.stubGlobal("fetch", idp.fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects to the authorization endpoint with prompt=consent create", async () => {
    let redirectTo = "";
    await redirectForSignUp(IDP, `${APP}#ignored`, undefined, (url) => {
      redirectTo = url;
    });

    const url = new URL(redirectTo);
    expect(url.origin + url.pathname).toBe("https://idp.example/.oidc/auth");
    expect(url.searchParams.get("prompt")).toBe(SIGN_UP_PROMPT);
    expect(url.searchParams.get("prompt")).toBe("consent create");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("openid offline_access webid");
    expect(url.searchParams.get("client_id")).toBe(DYNAMIC_CLIENT_ID);
    expect(url.searchParams.get("redirect_uri")).toBe(APP);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("state")).toBe(
      sessionStorage.getItem("csrf_token"),
    );

    const registration = idp.requests.find((r) => r.url.endsWith("/.oidc/reg"));
    expect(JSON.parse(registration!.init!.body as string)).toMatchObject({
      redirect_uris: [APP],
      grant_types: ["authorization_code", "refresh_token"],
      token_endpoint_auth_method: "none",
    });
  });

  it("uses a Client ID Document without registering", async () => {
    let redirectTo = "";
    await redirectForSignUp(
      IDP,
      APP,
      { client_id: "https://app.example/clientid.jsonld" },
      (url) => {
        redirectTo = url;
      },
    );
    expect(new URL(redirectTo).searchParams.get("client_id")).toBe(
      "https://app.example/clientid.jsonld",
    );
    expect(idp.requests.some((r) => r.url.endsWith("/.oidc/reg"))).toBe(false);
    expect(sessionStorage.getItem("client_id")).toBeNull();
  });

  it("rejects an issuer that does not match the identity provider", async () => {
    await expect(
      // Same origin, so discovery succeeds, but the issuer is "https://idp.example/".
      redirectForSignUp("https://idp.example/tenant", APP, undefined, () => {}),
    ).rejects.toThrow(/RFC 9207/);
  });

  // Guards the contract with @uvdsl/solid-oidc-client-browser: the state we
  // leave in sessionStorage must let the unmodified library finish the login.
  it("is completed by the library's handleRedirectFromLogin", async () => {
    let redirectTo = "";
    await redirectForSignUp(IDP, APP, undefined, (url) => {
      redirectTo = url;
    });
    const authorization = new URL(redirectTo).searchParams;
    idp.setCodeChallenge(authorization.get("code_challenge")!);

    // The identity provider sends the user back with a code.
    const callback = new URL(APP);
    callback.searchParams.set("code", "authorization-code");
    callback.searchParams.set("state", authorization.get("state")!);
    callback.searchParams.set("iss", IDP);
    window.history.replaceState({}, "", callback.toString());

    const session = new SessionCore();
    await session.handleRedirectFromLogin();

    expect(session.isActive).toBe(true);
    expect(session.webId).toBe(WEB_ID);
    expect(sessionStorage.getItem("pkce_code_verifier")).toBeNull();
  });
});
