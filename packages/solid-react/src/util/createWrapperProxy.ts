import type { Resource } from "@ldobjects/solid";

export function createWrapperProxy<ResourceType extends Resource>(
  target: ResourceType,
): ResourceType {
  return new Proxy(target, {});
}
