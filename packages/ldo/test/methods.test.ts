import { blankNode, namedNode, quad, literal } from "@ldo/rdf-utils";
import type { LdoBuilder } from "../src/index";
import {
  createLdoDataset,
  getDataset,
  getRdfNode,
  serialize,
  toJsonLd,
  toNTriples,
  toTurtle,
  graphOf,
} from "../src/index";
import { SolidProfile } from "./profileData";
import { describe, beforeEach, it, expect } from "vitest";

describe("methods", () => {
  let ldoDataset: ReturnType<typeof createLdoDataset>;
  let builder: LdoBuilder<SolidProfile>;
  let profile: SolidProfile;

  beforeEach(() => {
    ldoDataset = createLdoDataset();
    builder = ldoDataset.usingType(SolidProfile);
    profile = builder.fromSubject("https://example.com/item");
  });

  it("getDataset returns the actual LdoDataset, not the GraphWriteDataset view", () => {
    const ds = getDataset(profile);
    // Must be the same object as the LdoDataset we created, not the view
    expect(ds).toBe(ldoDataset);
    // Cross-check: quads added directly to the returned dataset are visible through the profile
    ds.add(
      quad(
        namedNode("https://example.com/item"),
        namedNode("http://xmlns.com/foaf/0.1/name"),
        literal("Direct"),
      ),
    );
    expect(profile.name).toBe("Direct");
  });

  it("returns the underlying named node", () => {
    const node = getRdfNode(profile);
    expect(node.termType).toBe("NamedNode");
    expect(node.value).toBe("https://example.com/item");
  });

  it("returns the underlying blank node", () => {
    const blankProfile = builder.fromSubject(blankNode("person"));
    const node = getRdfNode(blankProfile);
    expect(node.termType).toBe("BlankNode");
    expect(node.value).toBe("person");
  });

  it("translates into turtle", async () => {
    profile.name = "Captain of Coolness";
    expect(await toTurtle(profile)).toBe(
      '<https://example.com/item> <http://xmlns.com/foaf/0.1/name> "Captain of Coolness" .\n',
    );
  });

  it("translates into n-triples", async () => {
    profile.name = "Captain of Coolness";
    expect(await toNTriples(profile)).toBe(
      '<https://example.com/item> <http://xmlns.com/foaf/0.1/name> "Captain of Coolness" .\n',
    );
  });

  it("uses the serialize method", async () => {
    profile.name = "Captain of Coolness";
    expect(await serialize(profile, { format: "Turtle" })).toBe(
      '<https://example.com/item> <http://xmlns.com/foaf/0.1/name> "Captain of Coolness" .\n',
    );
  });

  it.skip("translates into jsonld", async () => {
    profile.name = "Captain of Coolness";
    expect(await toJsonLd(profile)).toEqual([
      {
        "@id": "https://example.com/item",
        "http://xmlns.com/foaf/0.1/name": "Captain of Coolness",
      },
    ]);
  });

  it("errors when asked to convert to JsonLd", async () => {
    await expect(async () => toJsonLd(profile)).rejects.toThrow(
      "Not Implemented",
    );
  });

  it("returns named graphs where a predicate is stored", () => {
    const profileInGraph = builder
      .write("https://graphname.com")
      .fromSubject("https://example.com/item");
    profileInGraph.name = "Jackson";
    const graphs = graphOf(profileInGraph, "http://xmlns.com/foaf/0.1/name");
    expect(graphs[0].value).toBe("https://graphname.com");
  });
});
