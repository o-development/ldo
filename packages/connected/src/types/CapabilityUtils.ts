/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Resource } from "../Resource";
import type { Capability } from "packages/connected/src/ResourceCapability.js";
import type {
  SolidContainer,
  SolidLeaf,
  SolidResource,
} from "@ldo/connected-solid";

type GetCapabilityResource<C extends Capability<any>> = C extends Capability<
  infer R
>
  ? R
  : never;

type GetResourceCapabilityResource<C extends { capability: Capability<any> }> =
  C extends { capability: Capability<infer R> } ? R : never;

export type ApplyCapability<
  R extends Resource,
  C extends { namespace: string; capability: Capability<any> },
> = R & ExtractCapability<R, C>;

export type ExtractCapability<
  R extends Resource,
  C extends { namespace: string; capability: Capability<any> },
> = {
  [namespace in C["namespace"]]: R extends GetResourceCapabilityResource<C>
    ? ReturnType<C["capability"]>
    : never;
};

export type ApplyCapabilities<
  R extends Resource,
  Capabilities extends readonly unknown[],
> = Capabilities extends [
  infer Head extends { namespace: string; capability: Capability<any> },
  ...infer Tail,
]
  ? ApplyCapabilities<ApplyCapability<R, Head>, Tail>
  : R;

export type ExtractCapabilities<
  R extends Resource,
  Capabilities extends readonly unknown[],
> = Capabilities extends [
  infer Head extends { namespace: string; capability: Capability<any> },
  ...infer Tail,
]
  ? ExtractCapability<R, Head> & ExtractCapabilities<R, Tail>
  : Record<string, never>;

/**
 * Unwraps properties of an object, except the base object provided by R
 */
export type UnwrapExtension<T, R extends Resource> = T extends R
  ? T
  : T extends object
  ? { [K in keyof T]: UnwrapExtension<T[K], R> }
  : T;

export type Unwrap<T> = T extends object ? { [K in keyof T]: Unwrap<T[K]> } : T;

/**
 *
 *
 *
 *
 *
 * TESTING
 *
 *
 *
 *
 *
 */

type CapabilityTest = {
  namespace: "TEST";
  capability: (resource: Resource) => { ho: 6 };
};

type CapabilityTest2 = {
  namespace: "t2";
  capability: (resource: SolidLeaf<any>) => {
    a: 1;
    b: 2;
    c: 3;
  };
};

type T4 = ReturnType<CapabilityTest2["capability"]>;

type TTTT = CapabilityTest["capability"] extends Capability<
  Resource<`x${string}`>
>
  ? 1
  : 0;

type RCTest0 = GetCapabilityResource<CapabilityTest["capability"]>;

type RCTest1 = GetResourceCapabilityResource<CapabilityTest2>;

// export type ApplyCapability<
//   R extends Resource,
//   C extends ResourceCapability<string, any>,
// > = R & {
//   [namespace in C["namespace"]]: GetResourceCapabilityResource<C> extends R
//     ? C["capability"]
//     : never;
// };

type Test1 = ApplyCapability<
  SolidContainer<[]> | SolidLeaf<[]>,
  CapabilityTest
>;
type Test2 = ApplyCapability<Test1, CapabilityTest2>;

type XT2 = ExtractCapability<SolidResource<[]>, CapabilityTest2>;

type Test3 = ApplyCapabilities<
  SolidLeaf<[CapabilityTest, CapabilityTest2]>,
  [CapabilityTest, CapabilityTest2]
>;

type XTest3 = Unwrap<
  ExtractCapabilities<
    SolidLeaf<[CapabilityTest, CapabilityTest2]>,
    [CapabilityTest, CapabilityTest2]
  >
>;

type T5 = Awaited<ReturnType<Test3["getParentContainer"]>>;

type T3 = UnwrapExtension<Test2, SolidContainer<[]> | SolidLeaf<[]>>;

// export type ApplyCapabilities<
//   R extends Resource,
//   Capabilities extends ResourceCapability<string, Capability<Resource>>,
// > = never;
