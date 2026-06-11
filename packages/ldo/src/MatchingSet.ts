import type {
  DataFactory,
  DatasetCore,
  Quad,
  Quad_Object,
  Quad_Predicate,
  Quad_Subject,
  Term,
} from "@rdfjs/types";
import type { ITermWrapperConstructor } from "@rdfjs/wrapper";
import { termKey } from "./termKey.js";

type MatchPosition = "subject" | "object";

interface MatchPattern {
  subject?: Term;
  predicate?: Term;
  object?: Term;
  graph?: Term;
}

/**
 * A live Set<T> backed by a DatasetCore quad pattern.
 *
 * - Iteration is lazy: every call to values()/size/has() re-queries the dataset,
 *   so the set reflects concurrent mutations.
 * - Deduplication is at the term level (not JS reference identity).
 * - add() writes through the dataset (which may be a GraphWriteDataset view).
 * - delete() materializes matches first to avoid mutation-during-iteration.
 */
export class MatchingSet<T> implements Set<T> {
  /**
   * @param dataset MUST be the GraphWriteDataset view (not the raw store) so that
   *   (a) constructed wrappers inherit the write policy, and
   *   (b) add/delete follow write-graph and delete-everywhere semantics.
   */
  constructor(
    private readonly position: MatchPosition,
    private readonly pattern: MatchPattern,
    private readonly wrapperClass: ITermWrapperConstructor<T>,
    private readonly dataset: DatasetCore,
    private readonly factory: DataFactory,
  ) {}

  private *matchedTerms(): IterableIterator<Term> {
    const seen = new Set<string>();
    const matches = this.dataset.match(
      this.pattern.subject,
      this.pattern.predicate,
      this.pattern.object,
      this.pattern.graph,
    );
    for (const q of matches) {
      const term = this.position === "subject" ? q.subject : q.object;
      const key = termKey(term);
      if (seen.has(key)) continue;
      seen.add(key);
      yield term;
    }
  }

  *values(): SetIterator<T> {
    for (const term of this.matchedTerms()) {
      yield new this.wrapperClass(term, this.dataset, this.factory);
    }
  }

  keys(): SetIterator<T> {
    return this.values();
  }

  *entries(): SetIterator<[T, T]> {
    for (const v of this.values()) yield [v, v];
  }

  [Symbol.iterator](): SetIterator<T> {
    return this.values();
  }

  get size(): number {
    let n = 0;
    for (const _ of this.matchedTerms()) n++;
    return n;
  }

  forEach(
    cb: (item: T, index: T, set: Set<T>) => void,
    thisArg?: unknown,
  ): void {
    for (const item of this) cb.call(thisArg, item, item, this);
  }

  has(value: T): boolean {
    const term = value as unknown as Term;
    const m =
      this.position === "subject"
        ? this.dataset.match(
            term,
            this.pattern.predicate,
            this.pattern.object,
            this.pattern.graph,
          )
        : this.dataset.match(
            this.pattern.subject,
            this.pattern.predicate,
            term,
            this.pattern.graph,
          );
    for (const _ of m) return true;
    return false;
  }

  add(value: T): this {
    this.dataset.add(this.quadFor(value));
    return this;
  }

  delete(value: T): boolean {
    if (!this.has(value)) return false;
    const term = value as unknown as Term;
    const matches =
      this.position === "subject"
        ? [
            ...this.dataset.match(
              term,
              this.pattern.predicate,
              this.pattern.object,
              this.pattern.graph,
            ),
          ]
        : [
            ...this.dataset.match(
              this.pattern.subject,
              this.pattern.predicate,
              term,
              this.pattern.graph,
            ),
          ];
    for (const q of matches) this.dataset.delete(q);
    return true;
  }

  clear(): void {
    const matches = [
      ...this.dataset.match(
        this.pattern.subject,
        this.pattern.predicate,
        this.pattern.object,
        this.pattern.graph,
      ),
    ];
    for (const q of matches) this.dataset.delete(q);
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  private quadFor(value: T): Quad {
    if (this.position === "subject") {
      if (
        this.pattern.predicate === undefined ||
        this.pattern.object === undefined
      ) {
        throw new Error(
          "Cannot add to a subject-match set unless both predicate and object were specified in matchSubject()",
        );
      }
      return this.factory.quad(
        value as unknown as Quad_Subject,
        this.pattern.predicate as Quad_Predicate,
        this.pattern.object as Quad_Object,
      );
    }
    if (
      this.pattern.subject === undefined ||
      this.pattern.predicate === undefined
    ) {
      throw new Error(
        "Cannot add to an object-match set unless both subject and predicate were specified in matchObject()",
      );
    }
    return this.factory.quad(
      this.pattern.subject as Quad_Subject,
      this.pattern.predicate as Quad_Predicate,
      value as unknown as Quad_Object,
    );
  }
}
