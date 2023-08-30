import { DocumentStore, DocumentStoreDependencies } from "../../DocumentStore";
import { DataResource, DataResourceDependencies } from "./DataResource";

export interface DataResourceStoreDependencies
  extends DocumentStoreDependencies,
    DataResourceDependencies {}

export class DataResourceStore extends DocumentStore<
  DataResource,
  string,
  DataResourceStoreDependencies
> {
  protected create(initializer: string) {
    return new DataResource(initializer, this.dependencies);
  }

  protected normalizeInitializer(initializer: string): string {
    return DataResource.normalizeUri(initializer);
  }
}
