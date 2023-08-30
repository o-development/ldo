import { FetchableDocument } from "../FetchableDocument";
import { DocumentError } from "./DocumentError";

export class DocumentFetchError extends DocumentError {
  public readonly status: number;

  constructor(document: FetchableDocument, status: number, message: string) {
    super(document, message);
    this.status = status;
  }
}
