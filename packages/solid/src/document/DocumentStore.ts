import type { FetchableDocument } from "./FetchableDocument";

// This may eventually have fields
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DocumentStoreDependencies {}

export interface DocumentGetterOptions {
  autoLoad?: boolean;
}

export abstract class DocumentStore<
  DocumentType extends FetchableDocument,
  Initializer,
  Dependencies extends DocumentStoreDependencies,
> {
  protected documentMap: Map<Initializer, DocumentType>;
  protected dependencies: Dependencies;

  constructor(dependencies: Dependencies) {
    this.documentMap = new Map();
    this.dependencies = dependencies;
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
