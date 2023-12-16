import type { App } from "@solid/community-server";
import type {
  Container,
  ContainerUri,
  Leaf,
  LeafUri,
  SolidLdoDataset,
  UpdateResultError,
} from "../src";
import { changeData, commitData, createSolidLdoDataset } from "../src";
import {
  ROOT_CONTAINER,
  createApp,
  getAuthenticatedFetch,
} from "./solidServer.helper";
import {
  namedNode,
  quad as createQuad,
  literal,
  defaultGraph,
} from "@rdfjs/data-model";
import type { CreateSuccess } from "../src/requester/results/success/CreateSuccess";
import type { DatasetChanges } from "@ldo/rdf-utils";
import { createDataset } from "@ldo/dataset";
import type { Quad } from "@rdfjs/types";
import type { AggregateSuccess } from "../src/requester/results/success/SuccessResult";
import type {
  UpdateDefaultGraphSuccess,
  UpdateSuccess,
} from "../src/requester/results/success/UpdateSuccess";
import type { ResourceSuccess } from "../src/resource/resourceResult/ResourceResult";
import type {
  AggregateError,
  UnexpectedResourceError,
} from "../src/requester/results/error/ErrorResult";
import type { InvalidUriError } from "../src/requester/results/error/InvalidUriError";
import { Buffer } from "buffer";
import { PostShShapeType } from "./.ldo/post.shapeTypes";
import type {
  ServerHttpError,
  UnauthenticatedHttpError,
  UnexpectedHttpError,
} from "../src/requester/results/error/HttpErrorResult";
import type { NoncompliantPodError } from "../src/requester/results/error/NoncompliantPodError";

const TEST_CONTAINER_SLUG = "test_ldo/";
const TEST_CONTAINER_URI =
  `${ROOT_CONTAINER}${TEST_CONTAINER_SLUG}` as ContainerUri;
const SAMPLE_DATA_URI = `${TEST_CONTAINER_URI}sample.ttl` as LeafUri;
const SAMPLE2_DATA_URI = `${TEST_CONTAINER_URI}sample2.ttl` as LeafUri;
const SAMPLE_BINARY_URI = `${TEST_CONTAINER_URI}sample.txt` as LeafUri;
const SAMPLE2_BINARY_URI = `${TEST_CONTAINER_URI}sample2.txt` as LeafUri;
const SAMPLE_CONTAINER_URI =
  `${TEST_CONTAINER_URI}sample_container/` as ContainerUri;
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
const TEST_CONTAINER_TTL = `@prefix dc: <http://purl.org/dc/terms/>.
@prefix ldp: <http://www.w3.org/ns/ldp#>.
@prefix posix: <http://www.w3.org/ns/posix/stat#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

<> <urn:npm:solid:community-server:http:slug> "sample.txt";
    a ldp:Container, ldp:BasicContainer, ldp:Resource;
    dc:modified "2023-10-20T13:57:14.000Z"^^xsd:dateTime.
<sample.ttl> a ldp:Resource, <http://www.w3.org/ns/iana/media-types/text/turtle#Resource>;
    dc:modified "2023-10-20T13:57:14.000Z"^^xsd:dateTime.
<sample.txt> a ldp:Resource, <http://www.w3.org/ns/iana/media-types/text/plain#Resource>;
    dc:modified "2023-10-20T13:57:14.000Z"^^xsd:dateTime.
<> posix:mtime 1697810234;
    ldp:contains <sample.ttl>, <sample.txt>.
<sample.ttl> posix:mtime 1697810234;
    posix:size 522.
<sample.txt> posix:mtime 1697810234;
    posix:size 10.`;

async function testRequestLoads<ReturnVal>(
  request: () => Promise<ReturnVal>,
  loadingResource: Leaf | Container,
  loadingValues: Partial<{
    isLoading: boolean;
    isCreating: boolean;
    isReading: boolean;
    isUploading: boolean;
    isReloading: boolean;
    isDeleting: boolean;
  }>,
): Promise<ReturnVal> {
  const allLoadingValues = {
    isLoading: false,
    isCreating: false,
    isReading: false,
    isUploading: false,
    isReloading: false,
    isDeleting: false,
    ...loadingValues,
  };
  const [returnVal] = await Promise.all([
    request(),
    (async () => {
      Object.entries(allLoadingValues).forEach(([key, value]) => {
        if (loadingResource.type === "container" && key === "isUploading") {
          return;
        }
        expect(loadingResource[key]()).toBe(value);
      });
    })(),
  ]);
  return returnVal;
}

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
      authFetch(SAMPLE_CONTAINER_URI, {
        method: "DELETE",
      }),
    ]);
  });

  /**
   * Read
   */
  describe("read", () => {
    it("Reads a data leaf", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.type).toBe("dataReadSuccess");
      expect(
        solidLdoDataset.match(
          namedNode("http://example.org/#spiderman"),
          namedNode("http://www.perceive.net/schemas/relationship/enemyOf"),
          namedNode("http://example.org/#green-goblin"),
        ).size,
      ).toBe(1);
    });

    it("Auto reads a resource", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI, {
        autoLoad: true,
      });
      // Wait until the resource is auto-loaded
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!resource.isReading()) {
            clearInterval(interval);
            resolve();
          }
        }, 250);
      });
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
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.type).toBe("containerReadSuccess");
      expect(resource.children().length).toBe(2);
    });

    it("Reads a binary leaf", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_BINARY_URI);
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.type).toBe("binaryReadSuccess");
      expect(resource.isBinary()).toBe(true);
      expect(await resource.getBlob()?.text()).toBe("some text.");
    });

    it("Returns an absent result if the document doesn't exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.type).toBe("absentReadSuccess");
      if (result.type !== "absentReadSuccess") return;
      expect(result.resource.isAbsent()).toBe(true);
    });

    it("Returns an ServerError when an 500 error is returned", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 500 }));
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.isError).toBe(true);
      expect(result.type).toBe("serverError");
    });

    it("Returns an UnauthenticatedError on an 401 error is returned", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 401 }));
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.isError).toBe(true);
      expect(result.type).toBe("unauthenticatedError");
    });

    it("Returns an UnexpectedHttpError on a strange number error is returned", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 3942 }));
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.isError).toBe(true);
      expect(result.type).toBe("unexpectedHttpError");
    });

    it("Returns a NoncompliantPod error when no content type is returned", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(undefined, { status: 200, headers: {} }),
      );
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
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
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
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
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("unexpectedResourceError");
      expect(result.message).toBe("Something happened.");
    });

    it("Returns an error if there is no link header for a container request", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 200,
          headers: new Headers({ "content-type": "text/turtle" }),
        }),
      );
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(() => resource.read(), resource, {
        isLoading: true,
        isReading: true,
      });
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("noncompliantPodError");
      expect(result.message).toBe(
        "Response from https://solidweb.me/jackson3/test_ldo/ is not compliant with the Solid Specification: No link header present in request.",
      );
    });
  });

  /**
   * readIfUnfetched
   */
  describe("readIfUnfetched", () => {
    it("reads an unfetched container", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () => resource.readIfUnfetched(),
        resource,
        {
          isLoading: true,
          isReading: true,
        },
      );
      expect(result.type).toBe("containerReadSuccess");
      expect(resource.children().length).toBe(2);
    });

    it("reads an unfetched leaf", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const result = await testRequestLoads(
        () => resource.readIfUnfetched(),
        resource,
        {
          isLoading: true,
          isReading: true,
        },
      );
      expect(result.type).toBe("dataReadSuccess");
      expect(
        solidLdoDataset.match(
          namedNode("http://example.org/#spiderman"),
          namedNode("http://www.perceive.net/schemas/relationship/enemyOf"),
          namedNode("http://example.org/#green-goblin"),
        ).size,
      ).toBe(1);
    });

    it("returns a cached existing container", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      await resource.read();
      fetchMock.mockClear();
      const result = await resource.readIfUnfetched();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.type).toBe("containerReadSuccess");
      expect(resource.children().length).toBe(2);
    });

    it("returns a cached existing leaf", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      await resource.read();
      fetchMock.mockClear();
      const result = await resource.readIfUnfetched();
      expect(result.type).toBe("dataReadSuccess");
      expect(
        solidLdoDataset.match(
          namedNode("http://example.org/#spiderman"),
          namedNode("http://www.perceive.net/schemas/relationship/enemyOf"),
          namedNode("http://example.org/#green-goblin"),
        ).size,
      ).toBe(1);
    });

    it("returns a cached absent container", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_CONTAINER_URI);
      await resource.read();
      fetchMock.mockClear();
      const result = await resource.readIfUnfetched();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.type).toBe("absentReadSuccess");
    });

    it("returns a cached absent leaf", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      await resource.read();
      fetchMock.mockClear();
      const result = await resource.readIfUnfetched();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.type).toBe("absentReadSuccess");
    });
  });

  /**
   * Get Root Container
   */
  describe("rootContainer", () => {
    it("Finds the root container", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_BINARY_URI);
      const result = await resource.getRootContainer();
      expect(result.type).toBe("container");
      if (result.type !== "container") return;
      expect(result.uri).toBe(ROOT_CONTAINER);
      expect(result.isRootContainer()).toBe(true);
    });

    it("Returns an error if there is no link header for a container request", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 200,
          headers: new Headers({ "content-type": "text/turtle" }),
        }),
      );
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await resource.getRootContainer();
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("noncompliantPodError");
      expect(result.message).toBe(
        "Response from https://solidweb.me/jackson3/test_ldo/ is not compliant with the Solid Specification: No link header present in request.",
      );
    });

    it("An error to be returned if a common http error is encountered", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 500,
        }),
      );
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await resource.getRootContainer();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("serverError");
    });

    it("Returns an UnexpectedResourceError if an unknown error is triggered", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Something happened."));
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await resource.getRootContainer();
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("unexpectedResourceError");
      expect(result.message).toBe("Something happened.");
    });

    it("returns a NonCompliantPodError when there is no root", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 200,
          headers: new Headers({
            "content-type": "text/turtle",
            link: '<http://www.w3.org/ns/ldp#Resource>; rel="type"',
          }),
        }),
      );
      const resource = solidLdoDataset.getResource(ROOT_CONTAINER);
      const result = await resource.getRootContainer();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("noncompliantPodError");
    });
  });

  /**
   * ===========================================================================
   * Create
   * ===========================================================================
   */
  describe("createAndOverwrite", () => {
    it("creates a document that doesn't exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () => resource.createAndOverwrite(),
        resource,
        {
          isLoading: true,
          isCreating: true,
        },
      );

      expect(result.type).toBe("createSuccess");
      const createSuccess = result as CreateSuccess;
      expect(createSuccess.didOverwrite).toBe(false);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE2_DATA_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container.children().some((child) => child.uri === SAMPLE2_DATA_URI),
      ).toBe(true);
    });

    it("creates a data resource that doesn't exist while overwriting", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () => resource.createAndOverwrite(),
        resource,
        {
          isLoading: true,
          isCreating: true,
        },
      );
      expect(result.type).toBe("createSuccess");
      const createSuccess = result as CreateSuccess;
      expect(createSuccess.didOverwrite).toBe(true);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE_DATA_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container.children().some((child) => child.uri === SAMPLE_DATA_URI),
      ).toBe(true);
    });

    it("creates a container", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_CONTAINER_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () => resource.createAndOverwrite(),
        resource,
        {
          isLoading: true,
          isCreating: true,
        },
      );
      expect(result.type).toBe("createSuccess");
      const createSuccess = result as CreateSuccess;
      expect(createSuccess.didOverwrite).toBe(false);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE_CONTAINER_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container
          .children()
          .some((child) => child.uri === SAMPLE_CONTAINER_URI),
      ).toBe(true);
    });

    it("returns a delete error if delete failed", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 500,
        }),
      );
      const result = await resource.createAndOverwrite();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("serverError");
    });

    it("returns an error if the create fetch fails", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      fetchMock.mockImplementationOnce(async (...args) => {
        return authFetch(...args);
      });
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 500,
        }),
      );
      const result = await resource.createAndOverwrite();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("serverError");
    });

    it("returns an unexpected error if some unknown error is triggered", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      fetchMock.mockImplementationOnce(async (...args) => {
        return authFetch(...args);
      });
      fetchMock.mockImplementationOnce(async () => {
        throw new Error("Some Unknown");
      });
      const result = await resource.createAndOverwrite();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("unexpectedResourceError");
    });
  });

  describe("createIfAbsent", () => {
    it("creates a data resource that doesn't exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () => resource.createIfAbsent(),
        resource,
        {
          isLoading: true,
          isCreating: true,
        },
      );

      expect(result.type).toBe("createSuccess");
      const createSuccess = result as CreateSuccess;
      expect(createSuccess.didOverwrite).toBe(false);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE2_DATA_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container.children().some((child) => child.uri === SAMPLE2_DATA_URI),
      ).toBe(true);
    });

    it("doesn't overwrite a resources that does exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () => resource.createIfAbsent(),
        resource,
        {
          isLoading: true,
          isCreating: true,
        },
      );

      expect(result.type).toBe("dataReadSuccess");
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE_DATA_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container.children().some((child) => child.uri === SAMPLE_DATA_URI),
      ).toBe(true);
    });

    it("creates a container that doesn't exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_CONTAINER_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () => resource.createIfAbsent(),
        resource,
        {
          isLoading: true,
          isCreating: true,
        },
      );

      expect(result.type).toBe("createSuccess");
      const createSuccess = result as CreateSuccess;
      expect(createSuccess.didOverwrite).toBe(false);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE2_DATA_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container
          .children()
          .some((child) => child.uri === SAMPLE_CONTAINER_URI),
      ).toBe(true);
    });
  });

  /**
   * Delete
   */
  describe("deleteResource", () => {
    it("returns an unexpected http error if an unexpected value is returned", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 214,
        }),
      );
      const result = await resource.delete();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("unexpectedHttpError");
    });

    it("returns an unexpected resource error if an unknown error is triggered", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      fetchMock.mockImplementationOnce(async () => {
        throw new Error("Some unknwon");
      });
      const result = await resource.delete();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("unexpectedResourceError");
    });

    it("deletes a container", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await resource.delete();
      expect(result.type === "deleteSuccess");
    });

    it("returns an error on container read when deleting a container", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      fetchMock.mockResolvedValueOnce(
        new Response(SAMPLE_DATA_URI, {
          status: 500,
        }),
      );
      const result = await resource.delete();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("aggregateError");
      const aggregateError = result as AggregateError<
        | ServerHttpError
        | UnexpectedHttpError
        | UnauthenticatedHttpError
        | UnexpectedResourceError
        | NoncompliantPodError
      >;
      expect(aggregateError.errors[0].type).toBe("serverError");
    });

    it("returns an error on child delete read when deleting a container", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      fetchMock.mockImplementationOnce(authFetch);
      fetchMock.mockResolvedValueOnce(
        new Response(SAMPLE_DATA_URI, {
          status: 500,
        }),
      );
      const result = await resource.delete();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("aggregateError");
      const aggregateError = result as AggregateError<
        | ServerHttpError
        | UnexpectedHttpError
        | UnauthenticatedHttpError
        | UnexpectedResourceError
        | NoncompliantPodError
      >;
      expect(aggregateError.errors[0].type).toBe("serverError");
    });

    it("returns an error on container delete read when deleting a container", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      fetchMock.mockImplementationOnce(authFetch);
      fetchMock.mockImplementationOnce(authFetch);
      fetchMock.mockImplementationOnce(authFetch);
      fetchMock.mockResolvedValueOnce(
        new Response(SAMPLE_DATA_URI, {
          status: 500,
        }),
      );
      const result = await resource.delete();
      expect(result.isError).toBe(true);
      expect(result.type).toBe("aggregateError");
      const aggregateError = result as AggregateError<
        | ServerHttpError
        | UnexpectedHttpError
        | UnauthenticatedHttpError
        | UnexpectedResourceError
        | NoncompliantPodError
      >;
      expect(aggregateError.errors[0].type).toBe("serverError");
    });
  });

  /**
   * Update
   */
  describe("updateDataResource", () => {
    const changes: DatasetChanges<Quad> = {
      added: createDataset([
        createQuad(
          namedNode("http://example.org/#green-goblin"),
          namedNode("http://xmlns.com/foaf/0.1/name"),
          literal("Norman Osborn"),
          namedNode(SAMPLE_DATA_URI),
        ),
      ]),
      removed: createDataset([
        createQuad(
          namedNode("http://example.org/#green-goblin"),
          namedNode("http://xmlns.com/foaf/0.1/name"),
          literal("Green Goblin"),
          namedNode(SAMPLE_DATA_URI),
        ),
      ]),
    };

    it("applies changes to a Pod", async () => {
      const result = await solidLdoDataset.commitChangesToPod(changes);
      expect(result.type).toBe("aggregateSuccess");
      const aggregateSuccess = result as AggregateSuccess<
        ResourceSuccess<UpdateSuccess, Leaf>
      >;
      expect(aggregateSuccess.results.length).toBe(1);
      expect(aggregateSuccess.results[0].type === "updateSuccess").toBe(true);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode("http://example.org/#green-goblin"),
            namedNode("http://xmlns.com/foaf/0.1/name"),
            literal("Norman Osborn"),
            namedNode(SAMPLE_DATA_URI),
          ),
        ),
      );
    });

    it("handles an HTTP error", async () => {
      fetchMock.mockResolvedValueOnce(new Response("Error", { status: 500 }));
      const result = await solidLdoDataset.commitChangesToPod(changes);
      expect(result.isError).toBe(true);
      expect(result.type).toBe("aggregateError");
      const aggregateError = result as AggregateError<
        UpdateResultError | InvalidUriError
      >;
      expect(aggregateError.errors.length).toBe(1);
      expect(aggregateError.errors[0].type).toBe("serverError");
    });

    it("handles an unknown request", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw new Error("Some Error");
      });
      const result = await solidLdoDataset.commitChangesToPod(changes);
      expect(result.isError).toBe(true);
      expect(result.type).toBe("aggregateError");
      const aggregateError = result as AggregateError<
        UpdateResultError | InvalidUriError
      >;
      expect(aggregateError.errors.length).toBe(1);
      expect(aggregateError.errors[0].type).toBe("unexpectedResourceError");
    });

    it("errors when trying to update a container", async () => {
      const changes: DatasetChanges<Quad> = {
        added: createDataset([
          createQuad(
            namedNode("http://example.org/#green-goblin"),
            namedNode("http://xmlns.com/foaf/0.1/name"),
            literal("Norman Osborn"),
            namedNode(SAMPLE_CONTAINER_URI),
          ),
        ]),
      };
      const result = await solidLdoDataset.commitChangesToPod(changes);
      expect(result.isError).toBe(true);
      expect(result.type).toBe("aggregateError");
      const aggregateError = result as AggregateError<
        UpdateResultError | InvalidUriError
      >;
      expect(aggregateError.errors.length).toBe(1);
      expect(aggregateError.errors[0].type === "invalidUriError").toBe(true);
    });

    it("writes to the default graph without fetching", async () => {
      const changes: DatasetChanges<Quad> = {
        added: createDataset([
          createQuad(
            namedNode("http://example.org/#green-goblin"),
            namedNode("http://xmlns.com/foaf/0.1/name"),
            literal("Norman Osborn"),
            defaultGraph(),
          ),
        ]),
      };
      const result = await solidLdoDataset.commitChangesToPod(changes);
      expect(result.type).toBe("aggregateSuccess");
      const aggregateSuccess = result as AggregateSuccess<
        ResourceSuccess<UpdateSuccess | UpdateDefaultGraphSuccess, Leaf>
      >;
      expect(aggregateSuccess.results.length).toBe(1);
      expect(aggregateSuccess.results[0].type).toBe(
        "updateDefaultGraphSuccess",
      );
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode("http://example.org/#green-goblin"),
            namedNode("http://xmlns.com/foaf/0.1/name"),
            literal("Norman Osborn"),
            defaultGraph(),
          ),
        ),
      );
    });
  });

  /**
   * ===========================================================================
   * Upload
   * ===========================================================================
   */
  describe("uploadAndOverwrite", () => {
    it("uploads a document that doesn't exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_BINARY_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () =>
          resource.uploadAndOverwrite(
            Buffer.from("some text.") as unknown as Blob,
            "text/plain",
          ),
        resource,
        {
          isLoading: true,
          isUploading: true,
        },
      );

      expect(result.type).toBe("createSuccess");
      const createSuccess = result as CreateSuccess;
      expect(createSuccess.didOverwrite).toBe(false);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE2_BINARY_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container.children().some((child) => child.uri === SAMPLE2_BINARY_URI),
      ).toBe(true);
    });

    it("creates a binary resource that doesn't exist while overwriting", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_BINARY_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () =>
          resource.uploadAndOverwrite(
            Buffer.from("some text.") as unknown as Blob,
            "text/plain",
          ),
        resource,
        {
          isLoading: true,
          isUploading: true,
        },
      );
      expect(result.type).toBe("createSuccess");
      const createSuccess = result as CreateSuccess;
      expect(createSuccess.didOverwrite).toBe(true);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE_BINARY_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container.children().some((child) => child.uri === SAMPLE_BINARY_URI),
      ).toBe(true);
    });

    it("returns a delete error if delete failed", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_BINARY_URI);
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 500,
        }),
      );
      const result = await resource.uploadAndOverwrite(
        Buffer.from("some text.") as unknown as Blob,
        "text/plain",
      );
      expect(result.isError).toBe(true);
      expect(result.type).toBe("serverError");
    });

    it("returns an error if the create fetch fails", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_BINARY_URI);
      fetchMock.mockImplementationOnce(async (...args) => {
        return authFetch(...args);
      });
      fetchMock.mockResolvedValueOnce(
        new Response(TEST_CONTAINER_TTL, {
          status: 500,
        }),
      );
      const result = await resource.uploadAndOverwrite(
        Buffer.from("some text.") as unknown as Blob,
        "text/plain",
      );
      expect(result.isError).toBe(true);
      expect(result.type).toBe("serverError");
    });

    it("returns an unexpected error if some unknown error is triggered", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_BINARY_URI);
      fetchMock.mockImplementationOnce(async (...args) => {
        return authFetch(...args);
      });
      fetchMock.mockImplementationOnce(async () => {
        throw new Error("Some Unknown");
      });
      const result = await resource.uploadAndOverwrite(
        Buffer.from("some text.") as unknown as Blob,
        "text/plain",
      );
      expect(result.isError).toBe(true);
      expect(result.type).toBe("unexpectedResourceError");
    });
  });

  describe("uploadIfAbsent", () => {
    it("creates a binary resource that doesn't exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_BINARY_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () =>
          resource.uploadIfAbsent(
            Buffer.from("some text.") as unknown as Blob,
            "text/plain",
          ),
        resource,
        {
          isLoading: true,
          isUploading: true,
        },
      );

      expect(result.type).toBe("createSuccess");
      const createSuccess = result as CreateSuccess;
      expect(createSuccess.didOverwrite).toBe(false);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE2_BINARY_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container.children().some((child) => child.uri === SAMPLE2_BINARY_URI),
      ).toBe(true);
    });

    it("doesn't overwrite a binary resource that does exist", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_BINARY_URI);
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await testRequestLoads(
        () =>
          resource.uploadIfAbsent(
            Buffer.from("some text.") as unknown as Blob,
            "text/plain",
          ),
        resource,
        {
          isLoading: true,
          isUploading: true,
        },
      );

      expect(result.type).toBe("binaryReadSuccess");
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode(TEST_CONTAINER_URI),
            namedNode("http://www.w3.org/ns/ldp#contains"),
            namedNode(SAMPLE_BINARY_URI),
            namedNode(TEST_CONTAINER_URI),
          ),
        ),
      ).toBe(true);
      expect(
        container.children().some((child) => child.uri === SAMPLE_BINARY_URI),
      ).toBe(true);
    });
  });

  /**
   * ===========================================================================
   * Methods
   * ===========================================================================
   */
  describe("methods", () => {
    it("creates a data object for a specific subject", () => {
      const resource = solidLdoDataset.getResource(
        "https://example.com/resource.ttl",
      );
      const post = solidLdoDataset.createData(
        PostShShapeType,
        "https://example.com/subject",
        resource,
      );
      post.type = { "@id": "CreativeWork" };
      expect(post.type["@id"]).toBe("CreativeWork");
      commitData(post);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode("https://example.com/subject"),
            namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            namedNode("http://schema.org/CreativeWork"),
            namedNode("https://example.com/resource.ttl"),
          ),
        ),
      ).toBe(true);
    });

    it("uses changeData to start a transaction", () => {
      const resource = solidLdoDataset.getResource(
        "https://example.com/resource.ttl",
      );
      solidLdoDataset.add(
        createQuad(
          namedNode("https://example.com/subject"),
          namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          namedNode("http://schema.org/CreativeWork"),
          namedNode("https://example.com/resource.ttl"),
        ),
      );
      const post = solidLdoDataset
        .usingType(PostShShapeType)
        .fromSubject("https://example.com/subject");
      const cPost = changeData(post, resource);
      cPost.type = { "@id": "SocialMediaPosting" };
      expect(cPost.type["@id"]).toBe("SocialMediaPosting");
      commitData(cPost);
      expect(
        solidLdoDataset.has(
          createQuad(
            namedNode("https://example.com/subject"),
            namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            namedNode("http://schema.org/SocialMediaPosting"),
            namedNode("https://example.com/resource.ttl"),
          ),
        ),
      ).toBe(true);
    });
  });

  /**
   * ===========================================================================
   * Container-Specific Methods
   * ===========================================================================
   */
});
