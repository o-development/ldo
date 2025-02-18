import type { ProxyContext } from "../../ProxyContext";
import type { SubjectProxy } from "../../subjectProxy/SubjectProxy";
import { _getUnderlyingNode } from "../../types";
import { getNodeFromRawObject } from "../../util/getNodeFromRaw";
import { nodeToString } from "../../util/NodeSet";
import type { RawObject } from "../../util/RawObject";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class BasicLdSet<T extends RawObject>
  extends Set<T>
  implements LdSet<T>
{
  protected context: ProxyContext;
  private hashMap = new Map();

  constructor(proxyContext: ProxyContext) {
    super();
    this.context = proxyContext;
  }

  private hashFn(value: T) {
    return nodeToString(getNodeFromRawObject(value, this.context.contextUtil));
  }

  /**
   * ===========================================================================
   * Base Set Functions
   * ===========================================================================
   */

  add(value: T): this {
    const key = this.hashFn(value);
    if (!this.hashMap.has(key)) {
      this.hashMap.set(key, value);
      super.add(value);
    }
    return this;
  }

  clear(): void {
    this.hashMap.clear();
    super.clear();
  }

  delete(value: T): boolean {
    const key = this.hashFn(value);
    if (this.hashMap.has(key)) {
      this.hashMap.delete(key);
      return super.delete(value);
    }
    return false;
  }

  has(value: T): boolean {
    const key = this.hashFn(value);
    return this.hashMap.has(key);
  }

  /**
   * ===========================================================================
   * Array Functions
   * ===========================================================================
   */

  every<S extends T>(
    predicate: (value: T, set: LdSet<T>) => value is S,
    thisArg?: any,
  ): this is LdSet<S>;
  every(
    predicate: (value: T, set: LdSet<T>) => unknown,
    thisArg?: any,
  ): boolean;
  every(predicate: (value: T, set: LdSet<T>) => any, thisArg?: any): boolean {
    for (const value of this) {
      if (!predicate.call(thisArg, value, this)) return false;
    }
    return true;
  }

  some(
    predicate: (value: T, set: LdSet<T>) => unknown,
    thisArg?: any,
  ): boolean {
    for (const value of this) {
      if (predicate.call(thisArg, value, this)) return true;
    }
    return false;
  }

  forEach(
    callbackfn: (value: T, value2: T, set: LdSet<T>) => void,
    thisArg?: any,
  ): void {
    for (const value of this) {
      callbackfn.call(thisArg, value, value, this);
    }
  }

  map<U>(callbackfn: (value: T, set: LdSet<T>) => U, thisArg?: any): U[] {
    const returnValues: U[] = [];
    for (const value of this) {
      returnValues.push(callbackfn.call(thisArg, value, this));
    }
    return returnValues;
  }

  filter<S extends T>(
    predicate: (value: T, set: LdSet<T>) => value is S,
    thisArg?: any,
  ): LdSet<S>;
  filter(
    predicate: (value: T, set: LdSet<T>) => unknown,
    thisArg?: any,
  ): LdSet<T>;
  filter(
    predicate: (value: T, set: LdSet<T>) => any,
    thisArg?: unknown,
  ): LdSet<T> {
    const newSet = new BasicLdSet<T>(this.context);
    for (const value of this) {
      if (predicate.call(thisArg, value, this)) newSet.add(value);
    }
    return newSet;
  }

  reduce(
    callbackfn: (previousValue: T, currentValue: T, set: LdSet<T>) => T,
  ): T;
  reduce(
    callbackfn: (previousValue: T, currentValue: T, set: LdSet<T>) => T,
    initialValue: T,
  ): T;
  reduce<U>(
    callbackfn: (previousValue: U, currentValue: T, set: LdSet<T>) => U,
    initialValue: U,
  ): U;
  reduce(callbackfn: any, initialValue?: any): any {
    const iterator = this[Symbol.iterator]();
    let accumulator;

    if (initialValue === undefined) {
      const first = iterator.next();
      if (first.done) {
        throw new TypeError("Reduce of empty collection with no initial value");
      }
      accumulator = first.value;
    } else {
      accumulator = initialValue;
    }

    let result = iterator.next();
    while (!result.done) {
      accumulator = callbackfn(accumulator, result.value, this);
      result = iterator.next();
    }

    return accumulator;
  }

  /**
   * ===========================================================================
   * Set Methods
   * ===========================================================================
   */

  difference(other: Set<T>): LdSet<T> {
    return this.filter((value) => !other.has(value));
  }

  intersection(other: Set<T>): LdSet<T> {
    const newSet = new BasicLdSet<T>(this.context);
    const iteratingSet = this.size < other.size ? this : other;
    const comparingSet = this.size < other.size ? other : this;
    for (const value of iteratingSet) {
      if (comparingSet.has(value)) {
        newSet.add(value);
      }
    }
    return newSet;
  }

  isDisjointFrom(other: Set<T>): boolean {
    const iteratingSet = this.size < other.size ? this : other;
    const comparingSet = this.size < other.size ? other : this;
    for (const value of iteratingSet) {
      if (comparingSet.has(value)) return false;
    }
    return true;
  }

  isSubsetOf(other: Set<T>): boolean {
    if (this.size > other.size) return false;
    for (const value of this) {
      if (!other.has(value)) return false;
    }
    return true;
  }

  isSupersetOf(other: Set<T>): boolean {
    if (this.size < other.size) return false;
    for (const value of other) {
      if (!this.has(value)) return false;
    }
    return true;
  }

  symmetricDifference(other: Set<T>): LdSet<T> {
    const newSet = new BasicLdSet<T>(this.context);
    this.forEach((value) => newSet.add(value));
    other.forEach((value) => {
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
    });
    return newSet;
  }

  union(other: Set<T>): LdSet<T> {
    const newSet = new BasicLdSet<T>(this.context);
    this.forEach((value) => newSet.add(value));
    other.forEach((value) => newSet.add(value));
    return newSet;
  }
}
