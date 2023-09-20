import { ResourceError } from "./ErrorResult";

export class InvalidUriError extends ResourceError {
  readonly type = "invalidUriError" as const;

  constructor(uri: string, message?: string) {
    super(uri, message || `${uri} is an invalid uri.`);
  }
}
