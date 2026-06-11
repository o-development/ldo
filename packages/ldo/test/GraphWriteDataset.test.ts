import { describe, it, expect, beforeEach } from "vitest";
import { Store, DataFactory } from "n3";
import { GraphWriteDataset } from "../src/GraphWriteDataset";
import {
  OptionalAs,
  OptionalFrom,
  LiteralAs,
  LiteralFrom,
  SetFrom,
  TermAs,
  TermFrom,
  TermWrapper,
} from "@rdfjs/wrapper";

const { namedNode, literal, quad, defaultGraph } = DataFactory;

// A minimal person wrapper for through-the-wrapper tests
class Person extends TermWrapper {
  get name(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      "https://example.org/name",
      LiteralAs.string,
    );
  }
  set name(value: string | undefined) {
    OptionalAs.object(
      this,
      "https://example.org/name",
      value,
      LiteralFrom.string,
    );
  }
  get friend(): Set<Person> {
    return SetFrom.subjectPredicate(
      this,
      "https://example.org/friend",
      TermAs.instance(Person),
      TermFrom.instance,
    );
  }
}

const EX = "https://example.org/";
const p1 = namedNode(`${EX}p1`);
const p2 = namedNode(`${EX}p2`);
const p3 = namedNode(`${EX}p3`);
const namePred = namedNode(`${EX}name`);
const alice = literal("Alice");
const bob = literal("Bob");
const carol = literal("Carol");
const g1 = namedNode(`${EX}g1`);
const g2 = namedNode(`${EX}g2`);
const g3 = namedNode(`${EX}g3`);
const g4 = namedNode(`${EX}g4`);

function makeStore(): Store {
  const store = new Store();
  store.addQuad(quad(p1, namePred, alice, g1));
  store.addQuad(quad(p2, namePred, bob, g1));
  store.addQuad(quad(p1, namePred, alice, g2)); // duplicate in second graph
  store.addQuad(quad(p3, namePred, carol)); // default graph
  return store;
}

describe("GraphWriteDataset", () => {
  let store: Store;
  let view: GraphWriteDataset;

  beforeEach(() => {
    store = makeStore();
    view = new GraphWriteDataset(store, [g1], DataFactory);
  });

  it("1. add() writes to all configured write graphs only", () => {
    const twoGraphView = new GraphWriteDataset(store, [g3, g4], DataFactory);
    twoGraphView.add(quad(p1, namePred, literal("Dave")));

    const inG3 = [...store.match(p1, namePred, literal("Dave"), g3)];
    const inG4 = [...store.match(p1, namePred, literal("Dave"), g4)];
    const inDefault = [
      ...store.match(p1, namePred, literal("Dave"), defaultGraph()),
    ];
    const inG1 = [...store.match(p1, namePred, literal("Dave"), g1)];

    expect(inG3).toHaveLength(1);
    expect(inG4).toHaveLength(1);
    expect(inDefault).toHaveLength(0);
    expect(inG1).toHaveLength(0);
  });

  it("2. has() returns true when the triple exists in a named graph (default-graph quad query)", () => {
    // p2/name/Bob exists only in g1 — has() with a default-graph quad should return true
    const q = quad(p2, namePred, bob); // no graph → default graph
    expect(view.has(q)).toBe(true);
  });

  it("3. delete() removes the triple from all graphs", () => {
    view.delete(quad(p1, namePred, alice)); // removes from g1 AND g2

    const inG1 = [...store.match(p1, namePred, alice, g1)];
    const inG2 = [...store.match(p1, namePred, alice, g2)];
    expect(inG1).toHaveLength(0);
    expect(inG2).toHaveLength(0);
  });

  it("4. [Symbol.iterator] deduplicates triples across graphs; size agrees", () => {
    const quads = [...view];
    // p1/name/Alice appears in g1 and g2 → should yield once
    const aliceQuads = quads.filter(
      (q) => q.subject.value === p1.value && q.object.value === alice.value,
    );
    expect(aliceQuads).toHaveLength(1);

    // All unique triples: (p1,name,Alice), (p2,name,Bob), (p3,name,Carol)
    expect(quads).toHaveLength(3);
    expect(view.size).toBe(3);
  });

  it("5. match() result is also deduplicated and routes add() to write graphs", () => {
    const matchView = view.match(undefined, namePred) as GraphWriteDataset;
    const terms = [...matchView].map((q) => q.object.value).sort();
    expect(terms).toEqual(["Alice", "Bob", "Carol"]);

    // Add through the chained view — should land in g1 (view's write graph)
    matchView.add(quad(p1, namePred, literal("Eve")));
    const inG1 = [...store.match(p1, namePred, literal("Eve"), g1)];
    const inDefault = [
      ...store.match(p1, namePred, literal("Eve"), defaultGraph()),
    ];
    expect(inG1).toHaveLength(1);
    expect(inDefault).toHaveLength(0);
  });

  it("6. Through Person wrapper: set name removes old from all graphs, writes to write graph only", () => {
    const person1 = new Person(p1, view, DataFactory);
    person1.name = "Alicia";

    // Old value gone from both graphs
    expect([...store.match(p1, namePred, alice, g1)]).toHaveLength(0);
    expect([...store.match(p1, namePred, alice, g2)]).toHaveLength(0);

    // New value in write graph (g1) only — not in default graph
    expect([...store.match(p1, namePred, literal("Alicia"), g1)]).toHaveLength(
      1,
    );
    expect([
      ...store.match(p1, namePred, literal("Alicia"), defaultGraph()),
    ]).toHaveLength(0);

    // Reading back returns the new value
    expect(person1.name).toBe("Alicia");
  });

  it("7. WrappingSet via Person.friend: has() is graph-agnostic, size not inflated, add lands in write graph", () => {
    const friendPred = namedNode(`${EX}friend`);
    const p4 = namedNode(`${EX}p4`);

    // Add friend p4 in g1 and g2 to create a duplicate
    store.addQuad(quad(p1, friendPred, p4, g1));
    store.addQuad(quad(p1, friendPred, p4, g2));

    const person1 = new Person(p1, view, DataFactory);
    const friends = person1.friend;

    // Size should not be inflated by duplicate graphs
    expect(friends.size).toBe(1);

    // has() should find p4 even though it's in named graphs, not default
    const p4Wrapper = new Person(p4, view, DataFactory);
    expect(friends.has(p4Wrapper)).toBe(true);

    // add() should write to the view's write graph
    const p5 = namedNode(`${EX}p5`);
    const p5Wrapper = new Person(p5, view, DataFactory);
    friends.add(p5Wrapper);
    expect([...store.match(p1, friendPred, p5, g1)]).toHaveLength(1);
    expect([...store.match(p1, friendPred, p5, defaultGraph())]).toHaveLength(
      0,
    );
  });
});
