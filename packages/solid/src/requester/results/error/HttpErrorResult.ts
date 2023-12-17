import { ResourceError } from "./ErrorResult";

export type HttpErrorResultType =
  | ServerHttpError
  | UnexpectedHttpError
  | UnauthenticatedHttpError;

export abstract class HttpErrorResult extends ResourceError {
  public readonly status: number;
  public readonly headers: Headers;
  public readonly response: Response;

  constructor(uri: string, response: Response, message?: string) {
    super(
      uri,
      message ||
        `Request for ${uri} returned ${response.status} (${response.statusText}).`,
    );
    this.status = response.status;
    this.headers = response.headers;
    this.response = response;
  }

  static isnt(response: Response) {
    return (
      !(response.status >= 200 && response.status < 300) &&
      response.status !== 404 &&
      response.status !== 304
    );
  }

  static checkResponse(uri: string, response: Response) {
    if (ServerHttpError.is(response)) {
      return new ServerHttpError(uri, response);
    }
    if (UnauthenticatedHttpError.is(response)) {
      return new UnauthenticatedHttpError(uri, response);
    }
    if (HttpErrorResult.isnt(response)) {
      return new UnexpectedHttpError(uri, response);
    }
    return undefined;
  }
}

export class UnexpectedHttpError extends HttpErrorResult {
  readonly type = "unexpectedHttpError" as const;
}

export class UnauthenticatedHttpError extends HttpErrorResult {
  readonly type = "unauthenticatedError" as const;

  static is(response: Response) {
    return response.status === 401;
  }
}

export class ServerHttpError extends HttpErrorResult {
  readonly type = "serverError" as const;

  static is(response: Response) {
    return response.status >= 500 && response.status < 600;
  }
}
