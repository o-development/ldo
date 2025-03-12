import type { Resource } from "../../Resource";
import type { UnexpectedResourceError } from "./ErrorResult";
import { ResourceError } from "./ErrorResult";

export type NotificationCallbackError =
  | DisconnectedAttemptingReconnectError
  | DisconnectedNotAttemptingReconnectError
  | UnsupportedNotificationError
  | UnexpectedResourceError<Resource>;

/**
 * Indicates that the requested method for receiving notifications is not
 * supported by this Pod.
 */
export class UnsupportedNotificationError extends ResourceError<Resource> {
  readonly type = "unsupportedNotificationError" as const;
}

/**
 * Indicates that the socket has disconnected and is attempting to reconnect.
 */
export class DisconnectedAttemptingReconnectError extends ResourceError<Resource> {
  readonly type = "disconnectedAttemptingReconnectError" as const;
}

/**
 * Indicates that the socket has disconnected and is attempting to reconnect.
 */
export class DisconnectedNotAttemptingReconnectError extends ResourceError<Resource> {
  readonly type = "disconnectedNotAttemptingReconnectError" as const;
}
