import { ResourceError } from "./ErrorResult";

/**
 * A NoncompliantPodError is returned when the server responded in a way that is
 * not compliant with the Solid specification.
 */
export class NoRootContainerError extends ResourceError {
  readonly type = "noRootContainerError" as const;

  /**
   * @param uri - the URI of the requested resource
   * @param message - a custom message for the error
   */
  constructor(uri: string) {
    super(uri, `${uri} has not root container.`);
  }
}
