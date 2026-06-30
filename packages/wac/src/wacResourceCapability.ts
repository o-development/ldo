import type { SolidLeaf, SolidResource } from "@ldo/connected-solid";
import { WacNamespaceImpl } from "./WacNamespace";
import type { ApplyCapabilities } from "@ldo/connected";

// export type WacResourceCapability = ResourceCapability<
//   "wac",
//   SolidUri,
//   SolidResource,
//   WacNamespace
// >;

// export const wacResourceCapability: WacResourceCapability = {
//   name: "wac",

//   // this can check any conditions necessary for this capability to work
//   appliesTo(resource: unknown): resource is SolidResource {
//     return resource instanceof SolidResource;
//   },

//   extend<T extends SolidResource>(resource: T): T & { wac: WacNamespace } {
//     Object.assign(resource, { wac: new WacNamespaceImpl(resource) });
//     return resource as T & { wac: WacNamespace };
//   },
// };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wacResourceCapability = function (resource: SolidResource<any[]>) {
  return new WacNamespaceImpl(resource);
};

type T1 = ApplyCapabilities<
  SolidLeaf<[]>,
  [{ namespace: "wac"; capability: typeof wacResourceCapability }]
>;
