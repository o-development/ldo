import type { RequesterResult } from "../RequesterResult";

export abstract class ErrorResult extends Error implements RequesterResult {
  abstract type: string;
  readonly isError = true as const;

  constructor(message?: string) {
    super(message || "An error unkown error was encountered.");
  }
}

export abstract class ResourceError extends ErrorResult {
  readonly uri: string;

  constructor(uri: string, message?: string) {
    super(message || `An error unkown error for ${uri}`);
    this.uri = uri;
  }
}

export class AggregateError<ErrorType extends ErrorResult> extends ErrorResult {
  readonly type = "aggregateError" as const;
  readonly errors: ErrorType[];

  constructor(
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
      message ||
        `Encountered multiple errors:${allErrors.reduce(
          (agg, cur) => `${agg}\n${cur}`,
          "",
        )}`,
    );
    this.errors = allErrors;
  }
}

export class UnexpectedResourceError extends ResourceError {
  readonly type = "unexpectedResourceError" as const;
  error: Error;

  constructor(uri: string, error: Error) {
    super(uri, error.message);
    this.error = error;
  }

  static fromThrown(uri: string, err: unknown) {
    if (err instanceof Error) {
      return new UnexpectedResourceError(uri, err);
    } else if (typeof err === "string") {
      return new UnexpectedResourceError(uri, new Error(err));
    } else {
      return new UnexpectedResourceError(
        uri,
        new Error(`Error of type ${typeof err} thrown: ${err}`),
      );
    }
  }
}
