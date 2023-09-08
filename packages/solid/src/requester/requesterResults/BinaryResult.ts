import { RequesterResult } from "./RequesterResult";

export class BinaryResult extends RequesterResult {
  type = "binary" as const;
  readonly blob: Blob;

  constructor(uri: string, blob: Blob) {
    super(uri);
    this.blob = blob;
  }

  static is(response: Response): boolean {
    const contentType = response.headers.get("content-type");
    return !contentType || contentType !== "text/turtle";
  }
}
