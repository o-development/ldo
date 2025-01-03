import { ResourceError } from "../../../requester/results/error/ErrorResult";

/**
 * Indicates that the requested method for receiving notifications is not
 * supported by this Pod.
 */
export class UnsupportedNotificationError extends ResourceError {
  readonly type = "unsupportedNotificationError" as const;
}
