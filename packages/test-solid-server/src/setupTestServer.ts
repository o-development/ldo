/* eslint-disable @typescript-eslint/no-explicit-any */
import type { App } from "@solid/community-server";
import { createApp } from "./createServer.js";
import path from "path";
import type { ResourceInfo } from "./resourceUtils.js";
import { cleanResources, initResources } from "./resourceUtils.js";
import { generateAuthFetch } from "./authFetch.js";
import fs from "fs/promises";
import {
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
  type MockedFunction,
} from "vitest";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

// Use an increased timeout, since the CSS server takes too much setup time.
vi.setConfig({ testTimeout: 40_000, hookTimeout: 40_000 });

export function setupServer(
  port: number,
  resourceInfo: ResourceInfo,
  customConfigPath?: string,
  skipAuthentication?: boolean,
) {
  const data: {
    app: App;
    fetchMock: MockedFunction<
      (
        input: RequestInfo | URL,
        init?: RequestInit | undefined,
      ) => Promise<Response>
    >;
    authFetch: typeof fetch;
    rootUri: string;
  } = {
    rootUri: `http://localhost:${port}/`,
  } as any;

  let previousJestId: string | undefined;
  let previousNodeEnv: string | undefined;
  beforeAll(async () => {
    // Remove Jest ID so that community solid server doesn't use the Jest Import
    process.env.NODE_ENV = "other_test";
    // Start up the server
    data.app = await createApp(port, customConfigPath);
    await data.app.start();
    data.authFetch = skipAuthentication ? fetch : await generateAuthFetch(port);
  });

  afterAll(async () => {
    await data.app.stop();
    process.env.JEST_WORKER_ID = previousJestId;
    process.env.NODE_ENV = previousNodeEnv;
    const testDataPath = path.join(__dirname, `./data${port}`);
    await fs.rm(testDataPath, { recursive: true, force: true });
  });

  beforeEach(async () => {
    data.fetchMock = vi.fn(data.authFetch);
    // Create a new document called sample.ttl
    await initResources(data.rootUri, resourceInfo, data.authFetch);
  });

  afterEach(async () => {
    await cleanResources(data.rootUri, resourceInfo, data.authFetch);
  });

  return data;
}
