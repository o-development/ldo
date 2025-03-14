import { ResourceSuccess } from "@ldo/connected";
import type { Resource } from "@ldo/connected";

/**
 * Indicates that an update request to a resource was successful
 */
export class UpdateSuccess<
  ResourceType extends Resource,
> extends ResourceSuccess<ResourceType> {
  type = "updateSuccess" as const;
}

/**
 * Indicates that an update request to the default graph was successful. This
 * data was not written to a Pod. It was only written locally.
 */
export class UpdateDefaultGraphSuccess<
  ResourceType extends Resource,
> extends ResourceSuccess<ResourceType> {
  type = "updateDefaultGraphSuccess" as const;
}

/**
 * Indicates that LDO ignored an invalid update (usually because a container
 * attempted an update)
 */
export class IgnoredInvalidUpdateSuccess<
  ResourceType extends Resource,
> extends ResourceSuccess<ResourceType> {
  type = "ignoredInvalidUpdateSuccess" as const;
}
