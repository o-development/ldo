import type { nodeEventListener } from "@ldo/subscribable-dataset";
import type { QuadMatch } from "@ldo/rdf-utils";
import type { Quad } from "@rdfjs/types";
import type { ILdoDataset } from "@ldo/ldo";

type LdoDatasetKey = keyof ILdoDataset;

const ALL: QuadMatch = [null, null, null, null];

/**
 * LDO dataset properties whose results may change when anything in
 * the underlying dataset changes
 */
const WHOLE_READS: Set<LdoDatasetKey> = new Set([
  "toArray",
  "toCanonical",
  "toStream",
  "toString",
  "forEach",
  "map",
  "reduce",
  "some",
  "every",
  "filter",
  "union",
  "intersection",
  "difference",
  "equals",
  "contains",
  "size",
]);

/**
 * @internal
 *
 * Tracking dataset passes all properties to the underlying dataset
 * and intercepts the relevant ones
 */
class TrackingDatasetImpl {
  constructor(
    public originalDataset: ILdoDataset,
    public listener: nodeEventListener<Quad>,
  ) {
    const keys = getAllKeys(this.originalDataset);

    // add listener when it's not already added for the particular match
    const track = (m: QuadMatch) => {
      if (!this.originalDataset.listeners(m).includes(listener))
        this.originalDataset.on(m, listener);
    };

    for (const key of keys) {
      const descriptor = findDescriptorInChain(this.originalDataset, key);

      // pass along getters and props
      if (descriptor?.get || typeof this.originalDataset[key] !== "function") {
        Object.defineProperty(this, key, {
          get() {
            if (WHOLE_READS.has(key)) track(ALL);
            return this.originalDataset[key];
          },
        });
      } else {
        // pass along methods
        Object.defineProperty(this, key, {
          value: (...args: MethodCall<ILdoDataset>["args"]) => {
            const { key: methodKey, args: methodArgs } =
              asMethodCall<ILdoDataset>(key, args);
            if (methodKey === "usingType") {
              // execute usingType with this tracking dataset
              return this.originalDataset.usingType.apply(this, methodArgs);
            }
            if (methodKey === "match") {
              // intercept match and subscribe to changes
              const [s = null, p = null, o = null, g = null] = methodArgs;
              track([s, p, o, g] as QuadMatch);
            } else if (methodKey === "has") {
              // intercept has and subscribe to changes
              const quad = methodArgs[0];
              track([
                quad.subject,
                quad.predicate,
                quad.object,
                quad.graph,
              ] as QuadMatch);
            } else if (
              WHOLE_READS.has(methodKey) ||
              methodKey === Symbol.iterator
            ) {
              // subscribe to changes for methods affecting the entire dataset
              track(ALL);
            }

            // bail out of typescript shortcoming.
            // TypeScript doesn't pair call[0] and call[1] types, only unions
            return (
              this.originalDataset[methodKey] as (...args: unknown[]) => unknown
            )(...methodArgs);
          },
        });
      }
    }
  }
}

export type TrackingDataset<D> = D & { originalDataset: D };

/**
 * Tracking dataset is a wrapping class around a SubscribableDataset and its
 * extensions. It keeps track of reads to the dataset, and runs the listener
 * when matching data change later.
 */
export const TrackingDataset = TrackingDatasetImpl as unknown as new <
  D extends ILdoDataset,
>(
  dataset: D,
  listener: nodeEventListener<Quad>,
) => TrackingDataset<D>;

/**
 * Get all keys of an object, including keys from a prototype chain.
 * We exclude completely basic object keys
 */
function getAllKeys<Obj extends object>(obj: Obj): Set<keyof Obj> {
  const keys = new Set<keyof Obj>();

  let current = obj;

  while (current && current !== Object.prototype) {
    for (const k of Reflect.ownKeys(current)) {
      if (k !== "constructor") keys.add(k as keyof Obj);
    }

    // go a prototype level deeper
    current = Object.getPrototypeOf(current);
  }

  return keys;
}

/**
 * Find a key's property descriptor within the prototype chain of a given object
 */
function findDescriptorInChain(
  obj: object,
  key: PropertyKey,
): PropertyDescriptor | undefined {
  let current: object | null = obj;
  while (current && current !== Object.prototype) {
    const desc = Object.getOwnPropertyDescriptor(current, key);
    if (desc) return desc;
    current = Object.getPrototypeOf(current);
  }
  return undefined;
}

/**
 * Helper type that connects object's functional keys and their arguments into
 * a discriminated union
 */
type MethodCall<D> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof D]: D[K] extends (...args: infer P) => any
    ? { key: K; args: P }
    : never;
}[keyof D];

/**
 * Helper function to properly type object's functional keys and their values
 */
function asMethodCall<D>(key: keyof D, args: unknown[]): MethodCall<D> {
  return { key, args } as MethodCall<D>;
}
