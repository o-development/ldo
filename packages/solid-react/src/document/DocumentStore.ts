import { FetchableDocument } from "./FetchableDocument";

// This may eventually have fields
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DocumentStoreDependencies {}

export abstract class DocumentStore<
  DocumentType extends FetchableDocument,
  Initializer,
  Dependencies extends DocumentStoreDependencies
> {
  protected documentMap: Map<Initializer, DocumentType>;
  protected dependencies: Dependencies;

  constructor(dependencies: Dependencies) {
    this.documentMap = new Map();
    this.dependencies = dependencies;
  }

  get(initializerInput: Initializer): DocumentType {
    const initializer = this.normalizeInitializer(initializerInput);
    const document = this.documentMap.get(initializer);
    if (document) {
      return document;
    }
    const newDocument = this.create(initializer);
    this.documentMap.set(initializer, newDocument);
    return newDocument;
  }

  protected abstract create(initializer: Initializer): DocumentType;

  protected normalizeInitializer(initializer: Initializer): Initializer {
    return initializer;
  }
}
