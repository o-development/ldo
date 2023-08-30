import { FetchableDocument } from "../FetchableDocument";

export class DocumentError extends Error {
  public readonly document: FetchableDocument;

  constructor(document: FetchableDocument, message: string) {
    super(message);
    this.document = document;
  }
}
