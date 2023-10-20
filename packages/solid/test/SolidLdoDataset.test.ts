import type { App } from "@solid/community-server";
import type { ContainerUri, LeafUri, SolidLdoDataset } from "../src";
import { createSolidLdoDataset } from "../src";
import {
  ROOT_CONTAINER,
  createApp,
  getAuthenticatedFetch,
} from "./solidServer.helper";
import { namedNode } from "@rdfjs/data-model";

const TEST_CONTAINER_SLUG = "test_ldo/";
const TEST_CONTAINER_URI =
  `${ROOT_CONTAINER}${TEST_CONTAINER_SLUG}` as ContainerUri;
const SAMPLE_DATA_URI = `${TEST_CONTAINER_URI}sample.ttl` as LeafUri;
const SAMPLE2_DATA_URI = `${TEST_CONTAINER_URI}sample2.ttl` as LeafUri;
const SAMPLE_BINARY_URI = `${TEST_CONTAINER_URI}sample.txt` as LeafUri;
const SAMPLE2_BINARY_URI = `${TEST_CONTAINER_URI}sample2.txt` as LeafUri;
const SPIDER_MAN_TTL = `@base <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix rel: <http://www.perceive.net/schemas/relationship/> .

<#green-goblin>
    rel:enemyOf <#spiderman> ;
    a foaf:Person ;    # in the context of the Marvel universe
    foaf:name "Green Goblin" .

<#spiderman>
    rel:enemyOf <#green-goblin> ;
    a foaf:Person ;
    foaf:name "Spiderman", "Человек-паук"@ru .`;

describe("SolidLdoDataset", () => {
  let app: App;
  let authFetch: typeof fetch;
  let fetchMock: jest.Mock<
    Promise<Response>,
    [input: RequestInfo | URL, init?: RequestInit | undefined]
  >;
  let solidLdoDataset: SolidLdoDataset;

  beforeAll(async () => {
    // Start up the server
    app = await createApp();
    await app.start();

    authFetch = await getAuthenticatedFetch();

    await authFetch(ROOT_CONTAINER, {
      method: "POST",
      headers: {
        link: '<http://www.w3.org/ns/ldp#Container>; rel="type"',
        slug: TEST_CONTAINER_SLUG,
      },
    });
  });

  afterAll(async () => {
    app.stop();
  });

  beforeEach(async () => {
    fetchMock = jest.fn(authFetch);
    solidLdoDataset = createSolidLdoDataset({ fetch: fetchMock });
    // Create a new document called sample.ttl
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
    ]);
  });

  describe("read", () => {
    it("Reads a data leaf", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const result = await resource.read();
      expect(result.type).toBe("dataReadSuccess");
      expect(
        solidLdoDataset.match(
          namedNode("http://example.org/#spiderman"),
          namedNode("http://www.perceive.net/schemas/relationship/enemyOf"),
          namedNode("http://example.org/#green-goblin"),
        ).size,
      ).toBe(1);
    });

    it("Reads a container", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await resource.read();
      expect(result.type).toBe("containerReadSuccess");
      expect(resource.children().length).toBe(2);
    });

    it("Reads a binary leaf", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_BINARY_URI);
      const result = await resource.read();
      expect(result.type).toBe("binaryReadSuccess");
      expect(resource.isBinary()).toBe(true);
      expect(await resource.getBlob()?.text()).toBe("some text.");
    });

    it("Returns an absent result if the document doesn't exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await resource.read();
      expect(result.type).toBe("absentReadSuccess");
      if (result.type !== "absentReadSuccess") return;
      expect(result.resource.isAbsent()).toBe(true);
    });

    it("Returns an ServerError when an 500 error is returned", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 500 }));
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await resource.read();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("serverError");
    });

    it("Returns an UnauthenticatedError on an 401 error is returned", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 401 }));
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await resource.read();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("unauthenticatedError");
    });

    it("Returns an UnexpectedHttpError on a strange number error is returned", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 3942 }));
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await resource.read();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("unexpectedHttpError");
    });

    it("Returns a NoncompliantPod error when no content type is returned", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(undefined, { status: 200, headers: {} }),
      );
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await resource.read();
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("noncompliantPodError");
      expect(result.message).toBe(
        "Response from https://solidweb.me/jackson3/test_ldo/sample2.ttl is not compliant with the Solid Specification: Resource requests must return a content-type header.",
      );
    });

    it("Returns a NoncompliantPod error if invalid turtle is provided", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response("Error", {
          status: 200,
          headers: new Headers({ "content-type": "text/turtle" }),
        }),
      );
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await resource.read();
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("noncompliantPodError");
      expect(result.message).toBe(
        'Response from https://solidweb.me/jackson3/test_ldo/sample2.ttl is not compliant with the Solid Specification: Request returned noncompliant turtle: Unexpected "Error" on line 1.',
      );
    });

    it("Returns an UnexpectedResourceError if an unknown error is triggered", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Something happened."));
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await resource.read();
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("unexpectedResourceError");
      expect(result.message).toBe("Something happened.");
    });

    it("Returns an error if there is no link header for a container request", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(SPIDER_MAN_TTL, {
          status: 200,
          headers: new Headers({ "content-type": "text/turtle" }),
        }),
      );
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await resource.read();
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("noncompliantPodError");
      expect(result.message).toBe(
        "Response from https://solidweb.me/jackson3/test_ldo/ is not compliant with the Solid Specification: No link header present in request.",
      );
    });
  });
});
