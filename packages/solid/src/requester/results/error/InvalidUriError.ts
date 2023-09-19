import { ResourceError } from "./ErrorResult";

export class InvalidUriError extends ResourceError {
  readonly type = "invalidUriError" as const;
}
