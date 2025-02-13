/**
 * This file handles the underlying functionality of a set, including hidden
 * helper methods
 */
import type { Dataset } from "@rdfjs/types";
import type { ObjectNode, QuadMatch } from "@ldo/rdf-utils";
import type { ArrayProxyTarget } from "./createArrayHandler";
import type {
  _getNodeAtIndex,
  _getUnderlyingArrayTarget,
  _getUnderlyingDataset,
  _getUnderlyingMatch,
  _proxyContext,
} from "../types";
import { _getUnderlyingNode } from "../types";
import type { ProxyContext } from "../ProxyContext";

export class SetProxy<T> implements LdSet<T> {
  context: ProxyContext;
  quadMatch: QuadMatch;
  isSubjectOriented?: boolean;
  isLangStringSet?: boolean;

  constructor(
    context: ProxyContext,
    quadMatch: QuadMatch,
    isSubjectOriented?: boolean,
    isLangStringSet?: boolean,
  ) {
    this.context = context;
    this.quadMatch = quadMatch;
    this.isSubjectOriented = isSubjectOriented;
    this.isLangStringSet = isLangStringSet;
  }

  add(value: T): this {
    throw new Error("Method not implemented.");
  }

  clear(): void {
    throw new Error("Method not implemented.");
  }

  delete(value: T): boolean {
    throw new Error("Method not implemented.");
  }

  has(value: T): boolean {
    throw new Error("Method not implemented.");
  }

  get size(): number {
    throw new Error("Method not implemented.");
  }

  entries(): SetIterator<[T, T]> {
    throw new Error("Method not implemented.");
  }

  keys(): SetIterator<T> {
    throw new Error("Method not implemented.");
  }

  values(): SetIterator<T> {
    throw new Error("Method not implemented.");
  }

  every<S extends T>(predicate: (value: T, set: LdSet<T>) => value is S, thisArg?: any): this is LdSet<S>;

  every(predicate: (value: T, set: LdSet<T>) => unknown, thisArg?: any): boolean;
  every(predicate: unknown, thisArg?: unknown): boolean {
    throw new Error("Method not implemented.");
  }

  some(predicate: (value: T, set: LdSet<T>) => unknown, thisArg?: any): boolean {
    throw new Error("Method not implemented.");
  }

  forEach(callbackfn: (value: T, value2: T, set: LdSet<T>) => void, thisArg?: any): void {
    throw new Error("Method not implemented.");
  }

  map<U>(callbackfn: (value: T, set: LdSet<T>) => U, thisArg?: any): LdSet<T> {
    throw new Error("Method not implemented.");
  }

  filter<S extends T>(predicate: (value: T, set: LdSet<T>) => value is S, thisArg?: any): LdSet<S>;
  filter(predicate: (value: T, set: LdSet<T>) => unknown, thisArg?: any): LdSet<T>;
  filter(predicate: unknown, thisArg?: unknown): LdSet<T> | LdSet<S> {
    throw new Error("Method not implemented.");
  }

  reduce(callbackfn: (previousValue: T, currentValue: T, set: LdSet<T>) => T): T;
  reduce(callbackfn: (previousValue: T, currentValue: T, set: LdSet<T>) => T, initialValue: T): T;
  reduce<U>(callbackfn: (previousValue: U, currentValue: T, array: LdSet<T>) => U, initialValue: U): U;
  reduce(callbackfn: unknown, initialValue?: unknown): T | U {
    throw new Error("Method not implemented.");
  }

  difference(other: Set<T>): LdSet<T> {
    throw new Error("Method not implemented.");
  }

  intersection(other: Set<T>): LdSet<T> {
    throw new Error("Method not implemented.");
  }

  isDisjointFrom(other: Set<T>): boolean {
    throw new Error("Method not implemented.");
  }

  isSubsetOf(other: Set<T>): boolean {
    throw new Error("Method not implemented.");
  }

  isSupersetOf(other: Set<T>): boolean {
    throw new Error("Method not implemented.");
  }

  symmetricDifference(other: Set<T>): LdSet<T> {
    throw new Error("Method not implemented.");
  }

  union(other: Set<T>): LdSet<T> {
    throw new Error("Method not implemented.");
  }

  [Symbol.iterator](): SetIterator<T> {
    throw new Error("Method not implemented.");
  }

  [Symbol.toStringTag]: string;
}

export type ArrayProxy = Array<unknown> & {
  readonly [_getUnderlyingDataset]: Dataset;
  readonly [_getUnderlyingMatch]: ArrayProxyTarget[0];
  readonly [_getNodeAtIndex]: (index: number) => ObjectNode | undefined;
  readonly [_getUnderlyingArrayTarget]: ArrayProxyTarget;
  [_proxyContext]: ProxyContext;
};
