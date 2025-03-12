import type { Resource } from "../Resource";
import type { ResourceError } from "./error/ErrorResult";
import type { ResourceSuccess } from "./success/SuccessResult";

export type ResourceResult<ResourceType extends Resource> =
  | ResourceSuccess<ResourceType>
  | ResourceError<ResourceType>;
