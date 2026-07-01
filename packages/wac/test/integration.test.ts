import { createConnectedLdoDataset } from "@ldo/connected";
import {
  type SolidContainerUri,
  type SolidLeafUri,
  solidConnectedPlugin,
  type WacRule,
} from "@ldo/connected-solid";
import { nextGraphConnectedPlugin } from "@ldo/connected-nextgraph";
import { setupServer, type ResourceInfo } from "@ldo/test-solid-server";
import assert from "node:assert/strict";
import { wacResourceCapability } from "../src/wacResourceCapability.js";
import { describe, expect, it, beforeEach } from "vitest";

const ROOT_CONTAINER = "http://localhost:3001/";
const WEB_ID = "http://localhost:3001/example/profile/card#me";
const TEST_CONTAINER_SLUG = "test_ldo/";
const TEST_CONTAINER_URI =
  `${ROOT_CONTAINER}${TEST_CONTAINER_SLUG}` as SolidContainerUri;
const SAMPLE_DATA_URI = `${TEST_CONTAINER_URI}sample.ttl` as SolidLeafUri;
const SAMPLE2_DATA_SLUG = "sample2.ttl";
const SAMPLE2_DATA_URI =
  `${TEST_CONTAINER_URI}${SAMPLE2_DATA_SLUG}` as SolidLeafUri;
const SAMPLE_PROFILE_URI = `${TEST_CONTAINER_URI}profile.ttl` as SolidLeafUri;
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
const TEST_CONTAINER_ACL = `<#b30e3fd1-b5a8-4763-ad9d-e95de9cf7933> a <http://www.w3.org/ns/auth/acl#Authorization>;
<http://www.w3.org/ns/auth/acl#accessTo> <${TEST_CONTAINER_URI}>;
<http://www.w3.org/ns/auth/acl#default> <${TEST_CONTAINER_URI}>;
<http://www.w3.org/ns/auth/acl#mode> <http://www.w3.org/ns/auth/acl#Read>, <http://www.w3.org/ns/auth/acl#Write>, <http://www.w3.org/ns/auth/acl#Append>, <http://www.w3.org/ns/auth/acl#Control>;
<http://www.w3.org/ns/auth/acl#agent> <${WEB_ID}>;
<http://www.w3.org/ns/auth/acl#agentClass> <http://xmlns.com/foaf/0.1/Agent>, <http://www.w3.org/ns/auth/acl#AuthenticatedAgent>.`;
const SAMPLE_PROFILE_TTL = `
@prefix pim: <http://www.w3.org/ns/pim/space#> .

<${SAMPLE_PROFILE_URI}> pim:storage <https://example.com/A/>, <https://example.com/B/> .
`;

const OTHER_CONTAINER_SLUG = "other_container/";
const OTHER_CONTAINER_URI =
  `${TEST_CONTAINER_URI}${OTHER_CONTAINER_SLUG}` as SolidContainerUri;
const OTHER_CONTAINER_ACL = `
  @prefix acl: <http://www.w3.org/ns/auth/acl#>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.

  <#owner> a acl:Authorization;
    acl:accessTo <./>;
    acl:default <./>;
    acl:agent <${WEB_ID}>;
    acl:mode acl:Read, acl:Write, acl:Append, acl:Control.

  <#public> a acl:Authorization;
    acl:accessTo <./>;
    acl:agentClass foaf:Agent;
    acl:mode acl:Read, acl:Write.

  <#public-inherited> a acl:Authorization;
    acl:default <./>;
    acl:agentClass foaf:Agent;
    acl:mode acl:Read, acl:Control.
`;

const OTHER_RESOURCE_SLUG = "resource.ttl";
const OTHER_RESOURCE_URI =
  `${OTHER_CONTAINER_URI}${OTHER_RESOURCE_SLUG}` as SolidLeafUri;

const resourceInfo: ResourceInfo = {
  slug: TEST_CONTAINER_SLUG,
  isContainer: true,
  contains: [
    {
      slug: ".acl",
      isContainer: false,
      mimeType: "text/turtle",
      data: TEST_CONTAINER_ACL,
    },
    {
      slug: "sample.ttl",
      isContainer: false,
      mimeType: "text/turtle",
      data: SPIDER_MAN_TTL,
    },
    {
      slug: "sample.txt",
      isContainer: false,
      mimeType: "text/plain",
      data: "some text.",
    },
    {
      slug: "profile.ttl",
      isContainer: false,
      mimeType: "text/turtle",
      data: SAMPLE_PROFILE_TTL,
    },
    {
      slug: "sample_container/",
      isContainer: true,
      shouldNotInit: true,
      contains: [],
    },
    {
      slug: SAMPLE2_DATA_SLUG,
      isContainer: false,
      shouldNotInit: true,
      mimeType: "text/turtle",
      data: "",
    },
    {
      slug: OTHER_CONTAINER_SLUG,
      isContainer: true,
      contains: [
        {
          slug: ".acl",
          isContainer: false,
          mimeType: "text/turtle",
          data: OTHER_CONTAINER_ACL,
        },
        {
          slug: OTHER_RESOURCE_SLUG,
          isContainer: false,
          mimeType: "text/turtle",
          data: "<#this> a <#Test>.",
        },
      ],
    },
  ],
};

// createSolidConnectedPlugin(solidConnectedPlugin, [
//   wacPlugin,
//   acpPlugin,
//   notificationPlugin,
// ]);

// resourceCapabilities;

// createConnectedLdoDataset([
//   solidConnectedPlugin.with(wac),
//   nextGraphConnectedPlugin,
// ]);

// resourcePlugins - solidConnectedPlugin;

describe("Web Access Control resource capability", () => {
  let solidLdoDataset = createConnectedLdoDataset([
    solidConnectedPlugin.extendResource(wacResourceCapability, "wac"),
    nextGraphConnectedPlugin,
  ]);

  const s = setupServer(3001, resourceInfo);

  beforeEach(() => {
    solidLdoDataset = createConnectedLdoDataset([
      solidConnectedPlugin.extendResource(wacResourceCapability, "wac"),
      nextGraphConnectedPlugin,
    ]);
    solidLdoDataset.setContext("solid", { fetch: s.fetchMock });
  });

  describe("Get WAC rule", () => {
    it("Fetches a wac rules for a container that has a corresponding acl", async () => {
      console.log(
        Object.keys(
          solidConnectedPlugin.extendResource(wacResourceCapability, "wac"),
        ),
      );
      console.log(Object.keys(solidLdoDataset));
      const container = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      type T = typeof container;
      const wacResult = await container.wac.getWac();
      expect(wacResult.isError).toBe(false);
      assert(!wacResult.isError);
      const wacSuccess = wacResult;
      expect(wacSuccess.wacRule.public).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
      expect(wacSuccess.wacRule.authenticated).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
      expect(wacSuccess.wacRule.agent[WEB_ID]).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
    });

    it("Gets wac rules of a parent resource for a resource that does not have a corresponding acl", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(false);
      assert(!wacResult.isError);
      const wacSuccess = wacResult;
      expect(wacSuccess.wacRule.public).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
      expect(wacSuccess.wacRule.authenticated).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
      expect(wacSuccess.wacRule.agent[WEB_ID]).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
    });

    [true, false].forEach((ignoreCache) => {
      it(`[${
        ignoreCache ? "not cached" : "cached"
      }] Handle rule inheritance correctly, distinguish acl:accessTo (direct) and acl:default (inherited)`, async () => {
        const container = solidLdoDataset.getResource(OTHER_CONTAINER_URI);

        const containerWacResult = await container.wac.getWac({ ignoreCache });
        expect(containerWacResult.isError).toBe(false);
        // node:assert narrows types
        assert.ok(!containerWacResult.isError);

        expect(containerWacResult.wacRule.agent[WEB_ID]).toEqual({
          read: true,
          write: true,
          append: true,
          control: true,
        });

        expect(containerWacResult.wacRule.public).toEqual({
          read: true,
          write: true,
          append: false,
          control: false,
        });

        const resource = solidLdoDataset.getResource(OTHER_RESOURCE_URI);
        const result = await resource.read();
        assert.ok(!result.isError);

        const resourceWacResult = await resource.wac.getWac({ ignoreCache });
        assert.ok(!resourceWacResult.isError);

        expect(resourceWacResult.wacRule.agent[WEB_ID]).toEqual({
          read: true,
          write: true,
          append: true,
          control: true,
        });

        expect(resourceWacResult.wacRule.public).toEqual({
          read: true,
          write: false,
          append: false,
          control: true,
        });

        const finalContainerWacResult = await container.wac.getWac({
          ignoreCache,
        });
        assert.ok(!finalContainerWacResult.isError);
        expect(finalContainerWacResult.wacRule.public).toEqual({
          read: true,
          write: true,
          append: false,
          control: false,
        });
      });
    });

    it("uses cached values for a retrieved resource", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      await resource.wac.getWac();
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(false);
      assert(!wacResult.isError);
      const wacSuccess = wacResult;
      expect(wacSuccess.wacRule.public).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
      expect(wacSuccess.wacRule.authenticated).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
      expect(wacSuccess.wacRule.agent[WEB_ID]).toEqual({
        read: true,
        write: true,
        append: true,
        control: true,
      });
    });

    it("returns an error when an error is encountered fetching the aclUri", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      s.fetchMock.mockResolvedValueOnce(new Response("Error", { status: 500 }));
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("serverError");
    });

    it("returns an error when a document is not found", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE2_DATA_URI);
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("notFoundError");
    });

    it("returns a non-compliant error if a response is returned without a link header", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      s.fetchMock.mockResolvedValueOnce(
        new Response("Error", {
          status: 200,
        }),
      );
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(true);
      assert(wacResult.isError);
      expect(wacResult.type).toBe("noncompliantPodError");
      assert.equal(wacResult.type, "noncompliantPodError");
      expect(wacResult.message).toBe(
        `Response from ${SAMPLE_DATA_URI} is not compliant with the Solid Specification: No link header present in request.`,
      );
    });

    it("returns a non-compliant error if a response is returned without an ACL link", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      s.fetchMock.mockResolvedValueOnce(
        new Response("Error", {
          status: 200,
          headers: { link: `<card.meta>; rel="describedBy"` },
        }),
      );
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("noncompliantPodError");
      assert.equal(wacResult.type, "noncompliantPodError");
      expect(wacResult.message).toBe(
        `Response from ${SAMPLE_DATA_URI} is not compliant with the Solid Specification: There must be one link with a rel="acl"`,
      );
    });

    it("Returns an UnexpectedResourceError if an unknown error is triggered while getting the wac URI", async () => {
      s.fetchMock.mockRejectedValueOnce(new Error("Something happened."));
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const result = await resource.wac.getWac();
      expect(result.isError).toBe(true);
      if (!result.isError) return;
      expect(result.type).toBe("unexpectedResourceError");
      expect(result.message).toBe("Something happened.");
    });

    it("Returns an error if the request to get the ACL fails", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      s.fetchMock.mockResolvedValueOnce(
        new Response("", {
          status: 200,
          headers: { link: `<card.acl>; rel="acl"` },
        }),
      );
      s.fetchMock.mockResolvedValueOnce(new Response("Error", { status: 500 }));
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("serverError");
    });

    it.todo("Returns a non-compliant error if the root uri has no ACL");

    it("Returns an error if the request to the ACL resource returns invalid turtle", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      s.fetchMock.mockResolvedValueOnce(
        new Response("", {
          status: 200,
          headers: { link: `<card.acl>; rel="acl"` },
        }),
      );
      s.fetchMock.mockResolvedValueOnce(
        new Response("BAD TURTLE", { status: 200 }),
      );
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("noncompliantPodError");
      assert.equal(wacResult.type, "noncompliantPodError");
      expect(wacResult.message).toBe(
        `Response from http://localhost:3001/test_ldo/sample.ttl is not compliant with the Solid Specification: Request returned noncompliant turtle: Unexpected "BAD" on line 1.\nBAD TURTLE`,
      );
    });

    it("Returns an error if there was a problem getting the parent resource", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      s.fetchMock.mockResolvedValueOnce(
        new Response("", {
          status: 200,
          headers: { link: `<card.acl>; rel="acl"` },
        }),
      );
      s.fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
      s.fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("serverError");
    });

    it("returns a NonCompliantPodError when this is the root resource and it doesn't have an ACL", async () => {
      const resource = solidLdoDataset.getResource(ROOT_CONTAINER);
      s.fetchMock.mockResolvedValueOnce(
        new Response("", {
          status: 200,
          headers: { link: `<card.acl>; rel="acl"` },
        }),
      );
      s.fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
      const wacResult = await resource.wac.getWac();
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("noncompliantPodError");
      assert.equal(wacResult.type, "noncompliantPodError");
      expect(wacResult.message).toBe(
        `Response from ${ROOT_CONTAINER} is not compliant with the Solid Specification: Resource "${ROOT_CONTAINER}" has no Effective ACL resource`,
      );
    });
  });

  describe("Set WAC rule", () => {
    const newRules: WacRule = {
      public: { read: true, write: false, append: false, control: false },
      authenticated: {
        read: true,
        write: false,
        append: true,
        control: false,
      },
      agent: {
        [WEB_ID]: { read: true, write: true, append: true, control: true },
      },
    };

    it("sets wac rules for a resource that didn't have one before", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const result = await resource.wac.setWac(newRules);
      expect(result.isError).toBe(false);
      expect(result.type).toBe("setWacRuleSuccess");
      const readResult = await resource.wac.getWac({ ignoreCache: true });
      expect(readResult.isError).toBe(false);
      assert(!readResult.isError);
      expect(readResult.type).toBe("getWacRuleSuccess");
      const rules = readResult.wacRule;
      expect(rules).toEqual(newRules);
    });

    it("overwrites an existing access control rule", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      const result = await resource.wac.setWac(newRules);
      expect(result.isError).toBe(false);
      expect(result.type).toBe("setWacRuleSuccess");
      const readResult = await resource.wac.getWac({ ignoreCache: true });
      expect(readResult.isError).toBe(false);
      assert(!readResult.isError);
      expect(readResult.type).toBe("getWacRuleSuccess");
      const rules = readResult.wacRule;
      expect(rules).toEqual(newRules);
    });

    it("Does not write a rule when access is not granted to an agent", async () => {
      const moreRules = {
        ...newRules,
        public: { read: false, write: false, append: false, control: false },
      };
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      const result = await resource.wac.setWac(moreRules);
      expect(result.isError).toBe(false);
      expect(result.type).toBe("setWacRuleSuccess");
      const readResult = await resource.wac.getWac({ ignoreCache: true });
      expect(readResult.isError).toBe(false);
      assert(!readResult.isError);
      expect(readResult.type).toBe("getWacRuleSuccess");
      const rules = readResult.wacRule;
      expect(rules).toEqual(moreRules);
    });

    it("returns an error when an error is encountered fetching the aclUri", async () => {
      const resource = solidLdoDataset.getResource(SAMPLE_DATA_URI);
      s.fetchMock.mockResolvedValueOnce(new Response("Error", { status: 500 }));
      const wacResult = await resource.wac.setWac(newRules);
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("serverError");
    });

    it("Returns an error when the request to write the access rules throws an error", async () => {
      const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
      s.fetchMock.mockResolvedValueOnce(
        new Response("", {
          status: 200,
          headers: { link: `<card.acl>; rel="acl"` },
        }),
      );
      s.fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
      const wacResult = await resource.wac.setWac(newRules);
      expect(wacResult.isError).toBe(true);
      expect(wacResult.type).toBe("serverError");
    });
  });

  it("test", async () => {
    const resource = solidLdoDataset.getResource(TEST_CONTAINER_URI);
    const child = await resource.createChildIfAbsent("test.ttl");
    assert(!child.isError);

    const parent = await resource.getParentContainer();
    assert.ok(parent && !parent?.isError);
    console.log(await parent.wac.getWac());

    const grandparent = await parent.getParentContainer();
    assert(!grandparent?.isError);
    grandparent?.wac.getWac();
  });
});
