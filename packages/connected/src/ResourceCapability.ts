import type { Resource } from "@ldo/connected";

export interface Capability<R extends Resource<string>> {
  (resource: R): unknown;
}

export interface ResourceCapability<
  Namespace extends string,
  ResourceType extends Resource,
> {
  capability: Capability<ResourceType>;
  namespace: Namespace;
}
