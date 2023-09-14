import { RequesterResult } from "./RequesterResult";

export class BinaryResult extends RequesterResult {
  type = "binary" as const;
  readonly blob: Blob;
  readonly mimeType: string;

  constructor(uri: string, blob: Blob, mimeType: string) {
    super(uri);
    this.blob = blob;
    this.mimeType = mimeType;
  }

  static is(response: Response): boolean {
    const contentType = response.headers.get("content-type");
    return !contentType || contentType !== "text/turtle";
  }
}
