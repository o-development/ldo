import type { App } from "@solid/community-server";
import type { ConnectedLdoDataset } from "../src";
import { ROOT_CONTAINER, WEB_ID, createApp } from "./solidServer.helper";
import { generateAuthFetch } from "./authFetch.helper";
import type { SolidConnectedPlugin } from "@ldo/connected-solid";

describe("Link Traversal", () => {
  let app: App;
  let authFetch: typeof fetch;
  let fetchMock: jest.Mock<
    Promise<Response>,
    [input: RequestInfo | URL, init?: RequestInit | undefined]
  >;
  let solidLdoDataset: ConnectedLdoDataset<SolidConnectedPlugin[]>;

  let previousJestId: string | undefined;
  let previousNodeEnv: string | undefined;
  beforeAll(async () => {
    // Remove Jest ID so that community solid server doesn't use the Jest Import
    previousJestId = process.env.JEST_WORKER_ID;
    previousNodeEnv = process.env.NODE_ENV;
    delete process.env.JEST_WORKER_ID;
    process.env.NODE_ENV = "other_test";
    // Start up the server
    app = await createApp();
    await app.start();
    authFetch = await generateAuthFetch();
  });

  afterAll(async () => {
    app.stop();
    process.env.JEST_WORKER_ID = previousJestId;
    process.env.NODE_ENV = previousNodeEnv;
    const testDataPath = path.join(__dirname, "./data");
    await fs.rm(testDataPath, { recursive: true, force: true });
  });

  beforeEach(async () => {
    fetchMock = jest.fn(authFetch);
    solidLdoDataset = createSolidLdoDataset();
    solidLdoDataset.setContext("solid", { fetch: fetchMock });
    // Create a new document called sample.ttl
    await authFetch(ROOT_CONTAINER, {
      method: "POST",
      headers: {
        link: '<http://www.w3.org/ns/ldp#Container>; rel="type"',
        slug: TEST_CONTAINER_SLUG,
      },
    });
    await authFetch(TEST_CONTAINER_ACL_URI, {
      method: "PUT",
      headers: {
        "content-type": "text/turtle",
      },
      body: TEST_CONTAINER_ACL,
    });
    await Promise.all([
      authFetch(TEST_CONTAINER_URI, {
        method: "POST",
        headers: { "content-type": "text/turtle", slug: "sample.ttl" },
        body: SPIDER_MAN_TTL,
      }),
      authFetch(TEST_CONTAINER_URI, {
        method: "POST",
        headers: { "content-type": "text/plain", slug: "sample.txt" },
        body: "some text.",
      }),
      authFetch(TEST_CONTAINER_URI, {
        method: "POST",
        headers: { "content-type": "text/turtle", slug: "profile.ttl" },
        body: SAMPLE_PROFILE_TTL,
      }),
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      authFetch(SAMPLE_DATA_URI, {
        method: "DELETE",
      }),
      authFetch(SAMPLE2_DATA_URI, {
        method: "DELETE",
      }),
      authFetch(SAMPLE_BINARY_URI, {
        method: "DELETE",
      }),
      authFetch(SAMPLE2_BINARY_URI, {
        method: "DELETE",
      }),
      authFetch(SAMPLE_PROFILE_URI, {
        method: "DELETE",
      }),
      authFetch(SAMPLE_CONTAINER_URI, {
        method: "DELETE",
      }),
    ]);
    await authFetch(TEST_CONTAINER_URI, {
      method: "DELETE",
    });
  });
});
