import type { ResourceType } from "../abstract/AbstractResource";

export abstract class ResourceError extends Error {
  public abstract readonly currentResource: ResourceType;
  public abstract readonly type: string;
}
