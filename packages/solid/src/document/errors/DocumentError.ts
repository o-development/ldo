import type { FetchableDocument } from "../FetchableDocument";

export class DocumentError extends Error {
  public readonly document: FetchableDocument;
  public readonly status: number;

  constructor(document: FetchableDocument, status: number, message: string) {
    super(message);
    this.document = document;
    this.status = status;
  }
}
