export abstract class ErrorResult extends Error {
  readonly type = "error" as const;
  readonly uri: string;
  abstract readonly errorType: string;

  constructor(uri: string, message?: string) {
    super(message || "An error unkown error was encountered during a request.");
    this.uri = uri;
  }
}

export class UnexpectedError extends ErrorResult {
  error: Error;
  readonly errorType = "unexpected";

  constructor(uri: string, error: Error) {
    super(uri, error.message);
    this.error = error;
  }

  static fromThrown(uri: string, err: unknown) {
    if (err instanceof Error) {
      return new UnexpectedError(uri, err);
    } else if (typeof err === "string") {
      return new UnexpectedError(uri, new Error(err));
    } else {
      return new UnexpectedError(
        uri,
        new Error(`Error of type ${typeof err} thrown: ${err}`),
      );
    }
  }
}
