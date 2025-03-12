import type { Resource } from "../../Resource";
import { ResourceSuccess } from "./SuccessResult";

/**
 * Indicates that a specific resource is unfetched
 */
export class Unfetched<
  ResourceType extends Resource,
> extends ResourceSuccess<ResourceType> {
  readonly type = "unfetched" as const;
}
