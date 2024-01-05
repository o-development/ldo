import { ResourceError } from "./ErrorResult";

/**
 * A set of standard errors that can be returned as a result of an HTTP request
 */
export type HttpErrorResultType =
  | ServerHttpError
  | UnexpectedHttpError
  | UnauthenticatedHttpError;

/**
 * An error caused by an HTTP request
 */
export abstract class HttpErrorResult extends ResourceError {
  /**
   * The status of the HTTP request
   */
  public readonly status: number;

  /**
   * Headers returned by the HTTP request
   */
  public readonly headers: Headers;

  /**
   * Response returned by the HTTP request
   */
  public readonly response: Response;

  /**
   * @param uri - URI of the resource
   * @param response - The response returned by the HTTP requests
   * @param message - A custom message for the error
   */
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

  /**
   * Checks to see if a given response does not constitute an HTTP Error
   * @param response - The response of the request
   * @returns true if the response does not constitute an HTTP Error
   */
  static isnt(response: Response) {
    return (
      !(response.status >= 200 && response.status < 300) &&
      response.status !== 404 &&
      response.status !== 304
    );
  }

  /**
   * Checks a given response to see if it is a ServerHttpError, an
   * UnauthenticatedHttpError or a some unexpected error.
   * @param uri - The uri of the request
   * @param response - The response of the request
   * @returns An error if the response calls for it. Undefined if not.
   */
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

/**
 * An unexpected error as a result of an HTTP request. This is usually returned
 * when the HTTP request returns a status code LDO does not recognize.
 */
export class UnexpectedHttpError extends HttpErrorResult {
  readonly type = "unexpectedHttpError" as const;
}

/**
 * An UnauthenticatedHttpError triggers when a Solid server returns a 401 status
 * indicating that the request is not authenticated.
 */
export class UnauthenticatedHttpError extends HttpErrorResult {
  readonly type = "unauthenticatedError" as const;

  /**
   * Indicates if a specific response constitutes an UnauthenticatedHttpError
   * @param response - The request response
   * @returns true if this response constitutes an UnauthenticatedHttpError
   */
  static is(response: Response) {
    return response.status === 401;
  }
}

/**
 * A ServerHttpError triggers when a Solid server returns a 5XX status,
 * indicating that an error happened on the server.
 */
export class ServerHttpError extends HttpErrorResult {
  readonly type = "serverError" as const;

  /**
   * Indicates if a specific response constitutes a ServerHttpError
   * @param response - The request response
   * @returns true if this response constitutes a ServerHttpError
   */
  static is(response: Response) {
    return response.status >= 500 && response.status < 600;
  }
}
