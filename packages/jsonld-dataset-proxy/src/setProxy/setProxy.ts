/**
 * This file handles the underlying functionality of a set, including hidden
 * helper methods
 */
import type { Dataset } from "@rdfjs/types";
import type {
  ObjectNode,
  PredicateNode,
  QuadMatch,
  SubjectNode,
} from "@ldo/rdf-utils";
import {
  _isSubjectOriented,
  _getUnderlyingDataset,
  _proxyContext,
  _isLangString,
  _getUnderlyingMatch,
  _getUnderlyingNode,
} from "../types";
import type { ProxyContext } from "../ProxyContext";
import { addObjectToDataset } from "../util/addObjectToDataset";
import type { RawObject } from "../util/RawObject";
import { nodeToJsonldRepresentation } from "../util/nodeToJsonldRepresentation";
import { BasicLdSet } from "./ldSet/BasicLdSet";
import { getNodeFromRawObject } from "../util/getNodeFromRaw";

export class SetProxy<T extends RawObject> extends BasicLdSet<T> {
  private quadMatch: QuadMatch;
  private isLangStringSet?: boolean;

  constructor(
    context: ProxyContext,
    quadMatch: QuadMatch,
    isLangStringSet?: boolean,
  ) {
    super(context);
    this.quadMatch = quadMatch;
    this.isLangStringSet = isLangStringSet;
  }

  /**
   * Detects if this set is subject oriented. The set is subject oriented if the
   * given quadMatch has a predicate and an object but no subject, meanting
   */
  private isSubjectOriented(): boolean {
    if (this.quadMatch[0] && this.quadMatch[1] && !this.quadMatch[2])
      return false;
    if (this.quadMatch[1] && !this.quadMatch[0]) return true;
    throw new Error(
      `SetProxy has an invalid quad match: [${this.quadMatch[0]}, ${this.quadMatch[1]}, ${this.quadMatch[2]}, ${this.quadMatch[3]}]`,
    );
  }

  /**
   * Gets the subject, predicate and object for this set
   */
  private getSPO(value?: T): {
    subject?: SubjectNode;
    predicate: PredicateNode;
    object?: ObjectNode;
  } {
    const valueNode = value
      ? getNodeFromRawObject(value, this.context.contextUtil)
      : undefined;
    const subject: SubjectNode | undefined = this.isSubjectOriented()
      ? valueNode
      : this.quadMatch[0]!;
    const predicate = this.quadMatch[1]!;
    const object: ObjectNode | undefined = this.isSubjectOriented()
      ? this.quadMatch[2] ?? undefined
      : valueNode;
    return { subject, predicate, object };
  }

  add(value: T): this {
    // Add value
    const added = addObjectToDataset(value as RawObject, false, this.context);
    // Add connecting edges
    if (!this.isSubjectOriented) {
      addObjectToDataset(
        {
          "@id": this.quadMatch[0],
          [this.context.contextUtil.iriToKey(
            this.quadMatch[1]!.value,
            this.context.getRdfType(this.quadMatch[0]!),
          )]: added,
        } as RawObject,
        false,
        this.context,
      );
    } else {
      // Account for subject-oriented
      added[
        this.context.contextUtil.iriToKey(
          this.quadMatch[1]!.value,
          this.context.getRdfType(added[_getUnderlyingNode]),
        )
      ] = nodeToJsonldRepresentation(this.quadMatch[2]!, this.context);
    }
    return this;
  }

  clear(): void {
    for (const value of this) {
      this.delete(value);
    }
  }

  delete(value: T): boolean {
    const { dataset } = this.context;
    const { subject, predicate, object } = this.getSPO(value);
    dataset.deleteMatches(subject, predicate, object);
    return true;
  }

  has(value: T): boolean {
    const { dataset } = this.context;
    const { subject, predicate, object } = this.getSPO(value);
    return dataset.match(subject, predicate, object).size > 0;
  }

  get size() {
    const { dataset } = this.context;
    const { subject, predicate, object } = this.getSPO();
    return dataset.match(subject, predicate, object).size;
  }

  entries(): SetIterator<[T, T]> {
    const iteratorSet = new Set<[T, T]>();
    for (const value of this) {
      iteratorSet.add([value, value]);
    }
    return iteratorSet[Symbol.iterator]();
  }

  keys(): SetIterator<T> {
    return this.values();
  }

  values(): SetIterator<T> {
    return this[Symbol.iterator]();
  }

  [Symbol.iterator](): SetIterator<T> {
    const { dataset } = this.context;
    const { subject, predicate, object } = this.getSPO();
    const quads = dataset.match(subject, predicate, object);
    const collection: T[] = quads.toArray().map((quad) => {
      const quadSubject = this.isSubjectOriented() ? quad.object : quad.subject;
      return nodeToJsonldRepresentation(quadSubject, this.context) as T;
    });
    return new Set(collection)[Symbol.iterator]();
  }

  get [Symbol.toStringTag]() {
    // TODO: Change this to be human readable.
    return "LdSet";
  }

  get [_getUnderlyingDataset](): Dataset {
    return this.context.dataset;
  }

  get [_getUnderlyingMatch](): QuadMatch {
    return this.quadMatch;
  }

  get [_isSubjectOriented](): boolean {
    return this.isSubjectOriented();
  }

  get [_isLangString](): boolean {
    return !!this.isLangStringSet;
  }

  get [_proxyContext](): ProxyContext {
    return this.context;
  }

  set [_proxyContext](newContext: ProxyContext) {
    this.context = newContext;
  }
}
