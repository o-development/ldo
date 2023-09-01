import type {
  DocumentGetterOptions,
  DocumentStoreDependencies,
} from "../../DocumentStore";
import { DocumentStore } from "../../DocumentStore";
import type { DataResourceDependencies } from "./DataResource";
import { DataResource } from "./DataResource";

export interface DataResourceStoreDependencies
  extends DocumentStoreDependencies,
    DataResourceDependencies {}

export class DataResourceStore extends DocumentStore<
  DataResource,
  string,
  DataResourceStoreDependencies
> {
  protected create(
    initializer: string,
    documentGetterOptions: DocumentGetterOptions,
  ) {
    return new DataResource(initializer, {
      ...this.dependencies,
      documentGetterOptions,
    });
  }

  protected normalizeInitializer(initializer: string): string {
    return DataResource.normalizeUri(initializer);
  }
}
