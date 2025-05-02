/* eslint-disable @typescript-eslint/no-explicit-any */
import type { App } from "@solid/community-server";
import { createApp } from "./createServer";
import path from "path";
import type { ResourceInfo } from "./resourceUtils";
import { cleanResources, initResources } from "./resourceUtils";
import { generateAuthFetch } from "./authFetch";
import fs from "fs/promises";

export function setupServer(
  port: number,
  resourceInfo: ResourceInfo,
  customConfigPath?: string,
) {
  const data: {
    app: App;
    fetchMock: jest.Mock<
      Promise<Response>,
      [input: RequestInfo | URL, init?: RequestInit | undefined]
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
    previousJestId = process.env.JEST_WORKER_ID;
    previousNodeEnv = process.env.NODE_ENV;
    delete process.env.JEST_WORKER_ID;
    process.env.NODE_ENV = "other_test";
    // Start up the server
    data.app = await createApp(port, customConfigPath);
    await data.app.start();
    data.authFetch = await generateAuthFetch(port);
  });

  afterAll(async () => {
    data.app.stop();
    process.env.JEST_WORKER_ID = previousJestId;
    process.env.NODE_ENV = previousNodeEnv;
    const testDataPath = path.join(__dirname, "./data");
    await fs.rm(testDataPath, { recursive: true, force: true });
  });

  beforeEach(async () => {
    data.fetchMock = jest.fn(data.authFetch);
    // Create a new document called sample.ttl
    await initResources(data.rootUri, resourceInfo, data.authFetch);
  });

  afterEach(async () => {
    await cleanResources(data.rootUri, resourceInfo, data.authFetch);
  });

  return data;
}
