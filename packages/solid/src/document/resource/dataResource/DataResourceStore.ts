import type { DocumentGetterOptions } from "../../DocumentStore";
import { DocumentStore } from "../../DocumentStore";
import { DataResource } from "./DataResource";

export class DataResourceStore extends DocumentStore<DataResource, string> {
  protected create(
    initializer: string,
    documentGetterOptions?: DocumentGetterOptions,
  ) {
    return new DataResource(initializer, this.context, documentGetterOptions);
  }

  protected normalizeInitializer(initializer: string): string {
    return DataResource.normalizeUri(initializer);
  }
}
