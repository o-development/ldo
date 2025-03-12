import type { ResourceSuccess } from "./SuccessResult";

/**
 * Indicates that an update request to a resource was successful
 */
export interface UpdateSuccess extends ResourceSuccess {
  type: "updateSuccess";
}

/**
 * Indicates that an update request to the default graph was successful. This
 * data was not written to a Pod. It was only written locally.
 */
export interface UpdateDefaultGraphSuccess extends ResourceSuccess {
  type: "updateDefaultGraphSuccess";
}

/**
 * Indicates that LDO ignored an invalid update (usually because a container
 * attempted an update)
 */
export interface IgnoredInvalidUpdateSuccess extends ResourceSuccess {
  type: "ignoredInvalidUpdateSuccess";
}
