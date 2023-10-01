import type { Resource } from "@ldo/solid";

export function createWrapperProxy<ResourceType extends Resource>(
  target: ResourceType,
): ResourceType {
  return new Proxy(target, {});
}
