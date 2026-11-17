import { describe, it, expect, beforeEach } from "vitest";
import { Store, DataFactory } from "n3";
import {
  LiteralAs,
  LiteralFrom,
  OptionalAs,
  OptionalFrom,
  TermWrapper,
} from "@rdfjs/wrapper";
import { LdoBuilder } from "../src/LdoBuilder";

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
const namePred = namedNode(`${EX}name`);
const g1 = namedNode(`${EX}g1`);
const g2 = namedNode(`${EX}g2`);
const g3 = namedNode(`${EX}g3`);

function makeStore(): Store {
  const store = new Store();
  store.addQuad(quad(p1, namePred, literal("Alice"), g1));
  store.addQuad(quad(p2, namePred, literal("Bob"), g1));
  store.addQuad(quad(p1, namePred, literal("Alice"), g2));
  return store;
}

describe("LdoBuilder", () => {
  let store: Store;
  let builder: LdoBuilder<Person>;

  beforeEach(() => {
    store = makeStore();
    builder = new LdoBuilder(Person, store, DataFactory);
  });

  it("1. write(g3).fromSubject — new quad in g3 only; old values gone; reads see all graphs", () => {
    const person1 = builder.write(g3).fromSubject(p1);

    // Before write: can read Alice from g1 via union read
    expect(person1.name).toBe("Alice");

    // Set name — should delete from ALL graphs and write to g3
    person1.name = "Alicia";

    // Old value gone from g1 and g2
    expect([...store.match(p1, namePred, literal("Alice"), g1)]).toHaveLength(
      0,
    );
    expect([...store.match(p1, namePred, literal("Alice"), g2)]).toHaveLength(
      0,
    );

    // New value only in g3
    expect([...store.match(p1, namePred, literal("Alicia"), g3)]).toHaveLength(
      1,
    );
    expect([
      ...store.match(p1, namePred, literal("Alicia"), defaultGraph()),
    ]).toHaveLength(0);

    // Read still works
    expect(person1.name).toBe("Alicia");
  });

  it("2. write() returns a new builder; original write graphs unchanged", () => {
    const original = builder; // writes to default graph
    const derived = builder.write(g3);

    // They are different instances
    expect(derived).not.toBe(original);

    // Original still writes to default graph
    const origPerson = original.fromSubject(p1);
    origPerson.name = "Via default";
    expect([
      ...store.match(p1, namePred, literal("Via default"), defaultGraph()),
    ]).toHaveLength(1);
    expect([
      ...store.match(p1, namePred, literal("Via default"), g3),
    ]).toHaveLength(0);
  });

  it("3. matchSubject returns a live Set wired through the write policy", () => {
    const derivedBuilder = builder.write(g3);
    const subjects = derivedBuilder.matchSubject(namePred);

    expect(subjects.size).toBe(2); // p1 and p2 (p1 deduplicated across g1/g2)

    // Add a new person to the store → appears in the live set
    const p3 = namedNode(`${EX}p3`);
    store.addQuad(quad(p3, namePred, literal("Carol"), g1));
    expect(subjects.size).toBe(3);

    // Wrapper yielded from the set uses write graph g3
    let p1Wrapper: Person | undefined;
    for (const w of subjects) {
      if (w.value === p1.value) {
        p1Wrapper = w;
        break;
      }
    }
    expect(p1Wrapper).toBeDefined();
    p1Wrapper!.name = "Alicia";
    expect([...store.match(p1, namePred, literal("Alicia"), g3)]).toHaveLength(
      1,
    );
    expect([
      ...store.match(p1, namePred, literal("Alicia"), defaultGraph()),
    ]).toHaveLength(0);
  });

  it("4. matchObject returns a live Set wired through the write policy", () => {
    const knowsPred = namedNode(`${EX}knows`);
    store.addQuad(quad(p1, knowsPred, p2, g1));

    const objects = builder.write(g3).matchObject(p1, knowsPred);
    expect(objects.size).toBe(1);

    // The yielded wrapper writes to g3
    for (const w of objects) {
      w.name = "From object match";
      expect([
        ...store.match(w, namePred, literal("From object match"), g3),
      ]).toHaveLength(1);
    }
  });
});
