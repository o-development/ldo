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
  readonly errorType = "unexpected" as const;

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

export class AggregateError<ErrorType extends ErrorResult> extends ErrorResult {
  readonly errorType = "aggregate" as const;
  readonly errors: ErrorType[];

  constructor(
    uri: string,
    errors: (ErrorType | AggregateError<ErrorType>)[],
    message?: string,
  ) {
    const allErrors: ErrorType[] = [];
    errors.forEach((error) => {
      if (error instanceof AggregateError) {
        error.errors.forEach((subError) => {
          allErrors.push(subError);
        });
      } else {
        allErrors.push(error);
      }
    });
    super(
      uri,
      message ||
        `Encountered multiple errors:${allErrors.reduce(
          (agg, cur) => `${agg}\n${cur}`,
          "",
        )}`,
    );
    this.errors = allErrors;
  }
}
