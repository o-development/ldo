import { ResourceError } from "./ErrorResult";

/**
 * An InvalidUriError is returned when a URI was provided that is not a valid
 * URI.
 */
export class InvalidUriError extends ResourceError {
  readonly type = "invalidUriError" as const;

  constructor(uri: string, message?: string) {
    super(uri, message || `${uri} is an invalid uri.`);
  }
}
