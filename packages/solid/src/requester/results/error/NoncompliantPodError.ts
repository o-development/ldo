import { ResourceError } from "./ErrorResult";

export class NoncompliantPodError extends ResourceError {
  readonly type = "noncompliantPodError" as const;
  constructor(uri: string, message?: string) {
    super(
      uri,
      `Response from ${uri} is not compliant with the Solid Specification: ${message}`,
    );
  }
}
