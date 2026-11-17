import type {
  DataFactory,
  DatasetCore,
  Quad,
  Quad_Graph,
  Term,
} from "@rdfjs/types";
import { tripleKey } from "./termKey.js";

/**
 * An asymmetric DatasetCore view that routes writes to designated graphs while
 * reading/deleting across all graphs.
 *
 * Reads and iteration use `readBase` (which may be a match-result slice).
 * Writes (add/delete) always go through `writeBase` (the root mutable store),
 * so adding through a chained match() result correctly reaches the underlying store.
 *
 * - add(quad): re-targets the triple into each write graph (ignores incoming graph).
 * - delete(quad): triple-level delete across ALL graphs in the write base.
 * - has(quad): triple-level existence check in ANY graph of the read base.
 * - match(...): returns a new GraphWriteDataset whose readBase is scoped to the
 *   pattern while writeBase remains the root store — so write policy survives chaining.
 * - [Symbol.iterator]: yields deduplicated triples projected to the default graph.
 */
export class GraphWriteDataset implements DatasetCore {
  constructor(
    private readonly readBase: DatasetCore,
    private readonly writeGraphs: Quad_Graph[],
    private readonly factory: DataFactory,
    public readonly writeBase: DatasetCore = readBase,
  ) {}

  add(quad: Quad): this {
    for (const g of this.writeGraphs) {
      this.writeBase.add(
        this.factory.quad(quad.subject, quad.predicate, quad.object, g),
      );
    }
    return this;
  }

  delete(quad: Quad): this {
    // Materialize before deleting to avoid mutation-during-iteration issues
    // with lazy stores (N3 can misbehave when iterated and mutated simultaneously).
    for (const q of [
      ...this.writeBase.match(quad.subject, quad.predicate, quad.object),
    ]) {
      this.writeBase.delete(q);
    }
    return this;
  }

  has(quad: Quad): boolean {
    for (const _ of this.readBase.match(
      quad.subject,
      quad.predicate,
      quad.object,
    ))
      return true;
    return false;
  }

  match(
    subject?: Term,
    predicate?: Term,
    object?: Term,
    graph?: Term,
  ): DatasetCore {
    return new GraphWriteDataset(
      this.readBase.match(subject, predicate, object, graph),
      this.writeGraphs,
      this.factory,
      this.writeBase, // writes always go to the root store, not the match slice
    );
  }

  *[Symbol.iterator](): Iterator<Quad> {
    const seen = new Set<string>();
    // Snapshot before yielding for mutation safety.
    for (const q of [...this.readBase]) {
      const key = tripleKey(q);
      if (seen.has(key)) continue;
      seen.add(key);
      // Project to default graph so consumers get a consistent view.
      yield this.factory.quad(q.subject, q.predicate, q.object);
    }
  }

  get size(): number {
    let n = 0;
    for (const _ of this) n++;
    return n;
  }
}
