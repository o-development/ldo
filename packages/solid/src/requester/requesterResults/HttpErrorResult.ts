import { ErrorResult } from "./ErrorResult";

export abstract class HttpErrorResult extends ErrorResult {
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

  async getBodyForDebug(): Promise<string> {
    if (this.response.bodyUsed) {
      return `Could not get body for ${this.uri} that yeilded status ${this.status}. The body stream has already been consumed.`;
    }
    return await this.response.text();
  }

  static isnt(response: Response) {
    return response.status < 200 || response.status >= 300;
  }
}

export class UnexpectedHttpError extends HttpErrorResult {
  errorType = "unexpectedHttp" as const;
}

export class UnauthenticatedHttpError extends HttpErrorResult {
  errorType = "unauthenticated" as const;

  static is(response: Response) {
    return response.status === 401;
  }
}

export class ServerHttpError extends HttpErrorResult {
  errorType = "server" as const;

  static is(response: Response) {
    return response.status >= 500 && response.status < 600;
  }
}
