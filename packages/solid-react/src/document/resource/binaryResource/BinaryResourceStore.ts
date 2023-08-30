import { DocumentStore, DocumentStoreDependencies } from "../../DocumentStore";
import { BinaryResource, BinaryResourceDependencies } from "./BinaryResource";

export interface BinaryResourceStoreDependencies
  extends DocumentStoreDependencies,
    BinaryResourceDependencies {}

export class BinaryResourceStore extends DocumentStore<
  BinaryResource,
  string,
  BinaryResourceStoreDependencies
> {
  create(initializer: string) {
    return new BinaryResource(initializer, this.dependencies);
  }

  protected normalizeInitializer(initializer: string): string {
    return BinaryResource.normalizeUri(initializer);
  }
}
