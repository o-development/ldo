import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type { FetchableDocument } from "./FetchableDocument";

export interface DocumentGetterOptions {
  autoLoad?: boolean;
}

export abstract class DocumentStore<
  DocumentType extends FetchableDocument,
  Initializer,
> {
  protected documentMap: Map<Initializer, DocumentType>;
  protected context: SolidLdoDatasetContext;

  constructor(context: SolidLdoDatasetContext) {
    this.documentMap = new Map();
    this.context = context;
  }

  get(
    initializerInput: Initializer,
    options?: DocumentGetterOptions,
  ): DocumentType {
    const initializer = this.normalizeInitializer(initializerInput);
    const document = this.documentMap.get(initializer);
    if (document) {
      if (options?.autoLoad) {
        document.reload();
      }
      return document;
    }
    const newDocument = this.create(initializer, options);
    this.documentMap.set(initializer, newDocument);
    return newDocument;
  }

  protected abstract create(
    initializer: Initializer,
    options?: DocumentGetterOptions,
  ): DocumentType;

  protected normalizeInitializer(initializer: Initializer): Initializer {
    return initializer;
  }
}
