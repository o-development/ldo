import { ErrorResult } from "./ErrorResult";
import { RequesterResult } from "./RequesterResult";

export class DataResult extends RequesterResult {
  type = "data" as const;

  static is(response: Response): boolean {
    const contentType = response.headers.get("content-type");
    return !!contentType && contentType === "text/turtle";
  }
}

export class TurtleFormattingError extends ErrorResult {
  errorType = "turtleFormatting" as const;
}
