import type { ContainerUri, LeafUri } from "@ldo/solid";
import { ROOT_CONTAINER, createApp } from "./solidServer.helper";
import type { App } from "@solid/community-server";
import fetch from "cross-fetch";

export const TEST_CONTAINER_SLUG = "test_ldo/";
export const TEST_CONTAINER_URI =
  `${ROOT_CONTAINER}${TEST_CONTAINER_SLUG}` as ContainerUri;
export const SAMPLE_DATA_URI = `${TEST_CONTAINER_URI}sample.ttl` as LeafUri;
export const SAMPLE2_DATA_SLUG = "sample2.ttl";
export const SAMPLE2_DATA_URI =
  `${TEST_CONTAINER_URI}${SAMPLE2_DATA_SLUG}` as LeafUri;
export const SAMPLE_BINARY_URI = `${TEST_CONTAINER_URI}sample.txt` as LeafUri;
export const SAMPLE2_BINARY_SLUG = `sample2.txt`;
export const SAMPLE2_BINARY_URI =
  `${TEST_CONTAINER_URI}${SAMPLE2_BINARY_SLUG}` as LeafUri;
export const SAMPLE_CONTAINER_URI =
  `${TEST_CONTAINER_URI}sample_container/` as ContainerUri;
export const SPIDER_MAN_TTL = `@base <http://example.org/> .
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
export const TEST_CONTAINER_TTL = `@prefix dc: <http://purl.org/dc/terms/>.
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

export interface SetUpServerReturn {
  app: App;
  authFetch: typeof fetch;
  fetchMock: jest.Mock<
    Promise<Response>,
    [input: RequestInfo | URL, init?: RequestInit | undefined]
  >;
}

export function setUpServer(): SetUpServerReturn {
  // Ignore to build s
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const s: SetUpServerReturn = {};

  beforeAll(async () => {
    // Start up the server
    s.app = await createApp();
    await s.app.start();

    // s.authFetch = await getAuthenticatedFetch();
    s.authFetch = fetch;
  });

  afterAll(async () => {
    s.app.stop();
  });

  beforeEach(async () => {
    s.fetchMock = jest.fn(s.authFetch);
    // Create a new document called sample.ttl
    await s.authFetch(ROOT_CONTAINER, {
      method: "POST",
      headers: {
        link: '<http://www.w3.org/ns/ldp#Container>; rel="type"',
        slug: TEST_CONTAINER_SLUG,
      },
    });
    await Promise.all([
      s.authFetch(TEST_CONTAINER_URI, {
        method: "POST",
        headers: { "content-type": "text/turtle", slug: "sample.ttl" },
        body: SPIDER_MAN_TTL,
      }),
      s.authFetch(TEST_CONTAINER_URI, {
        method: "POST",
        headers: { "content-type": "text/plain", slug: "sample.txt" },
        body: "some text.",
      }),
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      s.authFetch(SAMPLE_DATA_URI, {
        method: "DELETE",
      }),
      s.authFetch(SAMPLE2_DATA_URI, {
        method: "DELETE",
      }),
      s.authFetch(SAMPLE_BINARY_URI, {
        method: "DELETE",
      }),
      s.authFetch(SAMPLE2_BINARY_URI, {
        method: "DELETE",
      }),
      s.authFetch(SAMPLE_CONTAINER_URI, {
        method: "DELETE",
      }),
    ]);
  });

  return s;
}
