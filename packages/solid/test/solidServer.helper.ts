// Taken from https://github.com/comunica/comunica/blob/b237be4265c353a62a876187d9e21e3bc05123a3/engines/query-sparql/test/QuerySparql-solid-test.ts#L9

import * as path from "path";
import type { KeyPair } from "@inrupt/solid-client-authn-core";
import {
  buildAuthenticatedFetch,
  createDpopHeader,
  generateDpopKeyPair,
} from "@inrupt/solid-client-authn-core";
import type { App } from "@solid/community-server";
import { AppRunner, resolveModulePath } from "@solid/community-server";
import "jest-rdf";
import fetch from "cross-fetch";

const config = [
  {
    podName: process.env.USER_NAME || "example",
    email: process.env.EMAIL || "hello@example.com",
    password: process.env.PASSWORD || "abc123",
  },
];

export const SERVER_DOMAIN = process.env.SERVER || "http://localhost:3001/";
export const ROOT_ROUTE = process.env.ROOT_CONTAINER || "example/";
export const ROOT_CONTAINER = `${SERVER_DOMAIN}${ROOT_ROUTE}`;

// Use an increased timeout, since the CSS server takes too much setup time.
jest.setTimeout(40_000);

export async function createApp(): Promise<App> {
  if (process.env.SERVER) {
    return {
      start: () => {},
      stop: () => {},
    } as App;
  }
  const appRunner = new AppRunner();
  return appRunner.create(
    {
      mainModulePath: resolveModulePath(""),
      typeChecking: false,
    },
    resolveModulePath("config/default.json"),
    {},
    {
      port: 3_001,
      loggingLevel: "off",
      seededPodConfigJson: path.join(
        __dirname,
        "configs",
        "solid-css-seed.json",
      ),
    },
  );
}

export interface ISecretData {
  id: string;
  secret: string;
}

// From https://communitysolidserver.github.io/CommunitySolidServer/5.x/usage/client-credentials/
export async function getSecret(): Promise<ISecretData> {
  const result = await fetch(`${SERVER_DOMAIN}idp/credentials/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: config[0].email,
      password: config[0].password,
      name: config[0].podName,
    }),
  });
  const json = await result.json();
  return json;
}

export interface ITokenData {
  accessToken: string;
  dpopKey: KeyPair;
}

// From https://communitysolidserver.github.io/CommunitySolidServer/5.x/usage/client-credentials/
export async function refreshToken({
  id,
  secret,
}: ISecretData): Promise<ITokenData> {
  const dpopKey = await generateDpopKeyPair();
  const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
  const tokenUrl = `${SERVER_DOMAIN}.oidc/token`;
  const accessToken = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      // The header needs to be in base64 encoding.
      authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
      dpop: await createDpopHeader(tokenUrl, "POST", dpopKey),
    },
    body: "grant_type=client_credentials&scope=webid",
  })
    .then((res) => res.json())
    .then((res) => res.access_token);

  return { accessToken, dpopKey };
}

export async function getAuthenticatedFetch() {
  // Generate secret
  const secret = await getSecret();

  if (!secret) throw new Error("No Secret");

  // Get token
  const token = await refreshToken(secret);

  if (!token) throw new Error("No Token");

  // Build authenticated fetch
  const authFetch = await buildAuthenticatedFetch(fetch, token.accessToken, {
    dpopKey: token.dpopKey,
  });
  return authFetch;
}
