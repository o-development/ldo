import { ResourceError } from "../../../requester/results/error/ErrorResult";

export class UnsupportedNotificationError extends ResourceError {
  readonly type = "unexpectedResourceError" as const;
}
