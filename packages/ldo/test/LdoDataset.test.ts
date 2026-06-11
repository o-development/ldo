import { namedNode, quad, literal } from "@ldo/rdf-utils";
import { createDataset } from "@ldo/dataset";
import { SolidProfile } from "./profileData";
import type { LdoBuilder, LdoDataset } from "../src/index";
import { createLdoDataset, graphOf, parseRdf, toTurtle } from "../src/index";
import { sampleJsonld, sampleTurtle } from "./sampleData";
import { describe, beforeEach, it, expect } from "vitest";

describe("LdoDataset", () => {
  let ldoDataset: LdoDataset;
  let profileBuilder: LdoBuilder<SolidProfile>;

  beforeEach(async () => {
    ldoDataset = await parseRdf(sampleTurtle, {
      baseIRI: "https://solidweb.org/jackson/profile/card",
    });
    profileBuilder = ldoDataset.usingType(SolidProfile);
  });

  it("Creates a blank profile", async () => {
    ldoDataset = createLdoDataset();
    profileBuilder = ldoDataset.usingType(SolidProfile);
    const profile = profileBuilder.fromSubject(
      "https://example.com/person1#me",
    );
    profile.fn = "Diplo";
    expect(await toTurtle(profile)).toBe(
      '<https://example.com/person1#me> <http://www.w3.org/2006/vcard/ns#fn> "Diplo" .\n',
    );
  });

  // it("initializes a profile using the fromJson method", () => {
  //   const profile = profileBuilder.fromJson({
  //     type: set({ "@id": "Person" }, { "@id": "Person2" }),
  //     inbox: { "@id": "https://inbox.com" },
  //     fn: "Diplo",
  //   });
  //   expect(profile.inbox).toEqual({ "@id": "https://inbox.com" });
  //   expect(profile.fn).toBe("Diplo");
  //   expect(profile["@id"]).toBe(undefined);
  // });

  // it("initializes a profile with an id using the fromJson method", () => {
  //   const profile = profileBuilder.fromJson({
  //     "@id": "https://example.com/person1",
  //     type: set({ "@id": "Person" }, { "@id": "Person2" }),
  //     inbox: { "@id": "https://inbox.com" },
  //     fn: "Diplo",
  //   });
  //   expect(profile.inbox).toEqual({ "@id": "https://inbox.com" });
  //   expect(profile.fn).toBe("Diplo");
  //   expect(profile["@id"]).toBe("https://example.com/person1");
  // });

  it("retrieves a subject with a named node", () => {
    const profile = profileBuilder.fromSubject(
      namedNode("https://solidweb.org/jackson/profile/card#me"),
    );
    expect(profile.fn).toBe("Jackson Morgan");
  });

  it("retrieves a subject with a string id", () => {
    const profile = profileBuilder.fromSubject(
      "https://solidweb.org/jackson/profile/card#me",
    );
    expect(profile.fn).toBe("Jackson Morgan");
  });

  it("uses an existing dataset as the basis for the ldo", () => {
    const dataset = createDataset();
    dataset.add(
      quad(
        namedNode("https://example.com/person1"),
        namedNode("http://xmlns.com/foaf/0.1/name"),
        literal("Captain cool"),
      ),
    );
    const profile = createLdoDataset(dataset)
      .usingType(SolidProfile)
      .fromSubject("https://example.com/person1");
    expect(profile.name).toBe("Captain cool");
  });

  it("uses an existing array of quads as the basis for the ldo", () => {
    const quads = [
      quad(
        namedNode("https://example.com/person1"),
        namedNode("http://xmlns.com/foaf/0.1/name"),
        literal("Captain cool"),
      ),
    ];
    const profile = createLdoDataset(quads)
      .usingType(SolidProfile)
      .fromSubject("https://example.com/person1");
    expect(profile.name).toBe("Captain cool");
  });

  it("parses JsonLD", async () => {
    await expect(async () => parseRdf(sampleJsonld)).rejects.toThrow(
      "Not Implemented",
    );
    // ldoDataset = await parseRdf(sampleJsonld);
    // const profile = ldoDataset
    //   .usingType(SolidProfile)
    //   .fromSubject("https://example.com/item");
    // expect(profile.name).toBe("Captain of Coolness");
  });

  it("parses an existing dataset", async () => {
    const ldoDataset = await parseRdf(createDataset());
    expect(typeof ldoDataset.usingType).toBe("function");
  });

  it("Sets the proper write graphs", () => {
    const profile = profileBuilder
      .write("https://example.com/exampleGraph")
      .fromSubject("https://example.com/person1");
    profile.name = "Jackson";
    expect(graphOf(profile, "http://xmlns.com/foaf/0.1/name")[0].value).toBe(
      "https://example.com/exampleGraph",
    );
  });

  it("Lets a match query retrieve subjects", () => {
    const profiles = profileBuilder.matchSubject(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "http://xmlns.com/foaf/0.1/Person",
    );
    expect(Array.from(profiles)[0].fn).toBe("Jackson Morgan");
  });

  it("Handles alternate optionality for subject match", () => {
    const profiles = profileBuilder.matchSubject(
      undefined,
      undefined,
      "https://someGraph.com",
    );
    expect(profiles.size).toBe(0);
  });

  it("Lets a match query retrieve objects", () => {
    const profiles = profileBuilder.matchObject(
      undefined,
      "http://xmlns.com/foaf/0.1/primaryTopic",
    );
    expect(Array.from(profiles)[0].fn).toBe("Jackson Morgan");
  });

  it("Handles alternate optionality for object match", () => {
    const profiles = profileBuilder.matchObject(
      "https://someSubject",
      undefined,
      "https://someGraph.com",
    );
    expect(profiles.size).toBe(0);
  });

  // it("Sets language preferences", () => {
  //   const profile = profileBuilder
  //     .setLanguagePreferences("@none", "en")
  //     .fromSubject("https://solidweb.org/jackson/profile/card#me");
  //   expect(
  //     (profile as unknown as SubjectProxy)[_proxyContext].languageOrdering,
  //   ).toEqual(["@none", "en"]);
  // });
});
