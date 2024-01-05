import { ResourceError } from "./ErrorResult";

/**
 * A NoncompliantPodError is returned when the server responded in a way that is
 * not compliant with the Solid specification.
 */
export class NoncompliantPodError extends ResourceError {
  readonly type = "noncompliantPodError" as const;

  /**
   * @param uri - the URI of the requested resource
   * @param message - a custom message for the error
   */
  constructor(uri: string, message?: string) {
    super(
      uri,
      `Response from ${uri} is not compliant with the Solid Specification: ${message}`,
    );
  }
}
