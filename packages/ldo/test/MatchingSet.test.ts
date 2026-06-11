import { describe, it, expect, beforeEach } from "vitest";
import { Store, DataFactory } from "n3";
import {
  LiteralAs,
  LiteralFrom,
  OptionalAs,
  OptionalFrom,
  TermWrapper,
} from "@rdfjs/wrapper";
import { GraphWriteDataset } from "../src/GraphWriteDataset";
import { MatchingSet } from "../src/MatchingSet";

const { namedNode, literal, quad, defaultGraph } = DataFactory;

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
}

const EX = "https://example.org/";
const p1 = namedNode(`${EX}p1`);
const p2 = namedNode(`${EX}p2`);
const p3 = namedNode(`${EX}p3`);
const p4 = namedNode(`${EX}p4`);
const p5 = namedNode(`${EX}p5`);
const namePred = namedNode(`${EX}name`);
const knowsPred = namedNode(`${EX}knows`);
const g1 = namedNode(`${EX}g1`);
const g2 = namedNode(`${EX}g2`);
const g3 = namedNode(`${EX}g3`);

function makeStore(): Store {
  const store = new Store();
  store.addQuad(quad(p1, namePred, literal("Alice"), g1));
  store.addQuad(quad(p2, namePred, literal("Bob"), g1));
  store.addQuad(quad(p1, namePred, literal("Alice"), g2)); // duplicate triple in second graph
  store.addQuad(quad(p3, namePred, literal("Carol"))); // default graph
  return store;
}

describe("MatchingSet", () => {
  let store: Store;
  let view: GraphWriteDataset;

  beforeEach(() => {
    store = makeStore();
    view = new GraphWriteDataset(store, [g3], DataFactory);
  });

  function subjectSet(
    predicate = namePred,
    obj?: ReturnType<typeof literal> | ReturnType<typeof namedNode>,
  ) {
    return new MatchingSet<Person>(
      "subject",
      { predicate, object: obj },
      Person,
      view,
      DataFactory,
    );
  }

  function objectSet(subject = p1, predicate = knowsPred) {
    return new MatchingSet<Person>(
      "object",
      { subject, predicate },
      Person,
      view,
      DataFactory,
    );
  }

  it("1. matchSubject(namePred) yields p1, p2, p3 exactly once each", () => {
    const set = subjectSet();
    const values = [...set].map((p) => p.value).sort();
    expect(values).toEqual([p1.value, p2.value, p3.value].sort());
    expect(set.size).toBe(3);
  });

  it("2. liveness: adding a quad after construction appears in the next iteration", () => {
    const set = subjectSet();
    expect(set.size).toBe(3);

    store.addQuad(quad(p4, namePred, literal("Dave"), g1));

    expect(set.size).toBe(4);
    const values = [...set].map((p) => p.value);
    expect(values).toContain(p4.value);
  });

  it("3. has() uses term equality, not reference equality", () => {
    const set = subjectSet();
    // Construct a fresh wrapper for p1 — different instance but same term
    const freshP1 = new Person(p1, view, DataFactory);
    expect(set.has(freshP1)).toBe(true);
  });

  it("4. add(p5Wrapper) on matchSubject(namePred, 'Eve') asserts (p5, namePred, Eve) in write graphs", () => {
    const eveObj = literal("Eve");
    const set = new MatchingSet<Person>(
      "subject",
      { predicate: namePred, object: eveObj },
      Person,
      view,
      DataFactory,
    );
    const p5Wrapper = new Person(p5, view, DataFactory);
    set.add(p5Wrapper);

    expect([...store.match(p5, namePred, eveObj, g3)]).toHaveLength(1);
    expect([...store.match(p5, namePred, eveObj, defaultGraph())]).toHaveLength(
      0,
    );
  });

  it("5. add() on underspecified pattern (no object) throws", () => {
    const set = subjectSet(namePred, undefined);
    const p5Wrapper = new Person(p5, view, DataFactory);
    expect(() => set.add(p5Wrapper)).toThrow();
  });

  it("6. delete(p1Wrapper) removes p1/namePred/* across g1 and g2; has() then false", () => {
    const set = subjectSet();
    const p1Wrapper = new Person(p1, view, DataFactory);
    expect(set.has(p1Wrapper)).toBe(true);

    set.delete(p1Wrapper);

    expect([...store.match(p1, namePred, null, g1)]).toHaveLength(0);
    expect([...store.match(p1, namePred, null, g2)]).toHaveLength(0);
    expect(set.has(p1Wrapper)).toBe(false);
  });

  it("7. clear() empties the pattern; size === 0", () => {
    const set = subjectSet();
    expect(set.size).toBe(3);
    set.clear();
    expect(set.size).toBe(0);
    expect(store.size).toBe(0);
  });

  it("8. matchObject mirrors matchSubject for the object position", () => {
    // Set up: p1 knows p2 and p3 in g1
    store.addQuad(quad(p1, knowsPred, p2, g1));
    store.addQuad(quad(p1, knowsPred, p3, g1));

    const set = objectSet(p1, knowsPred);
    const values = [...set].map((p) => p.value).sort();
    expect(values).toEqual([p2.value, p3.value].sort());
    expect(set.size).toBe(2);

    // has() by term equality
    expect(set.has(new Person(p2, view, DataFactory))).toBe(true);

    // delete
    set.delete(new Person(p2, view, DataFactory));
    expect(set.size).toBe(1);
  });

  it("9. wrappers yielded from the set inherit write semantics", () => {
    const set = subjectSet();
    let p1Wrapper: Person | undefined;
    for (const w of set) {
      if (w.value === p1.value) {
        p1Wrapper = w;
        break;
      }
    }
    expect(p1Wrapper).toBeDefined();

    // Setting name on the yielded wrapper should write to g3 (the view's write graph)
    p1Wrapper!.name = "Aliased";
    expect([...store.match(p1, namePred, literal("Aliased"), g3)]).toHaveLength(
      1,
    );
    expect([
      ...store.match(p1, namePred, literal("Aliased"), defaultGraph()),
    ]).toHaveLength(0);
  });
});
