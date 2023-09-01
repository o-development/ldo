import type {
  DocumentGetterOptions,
  DocumentStoreDependencies,
} from "../../DocumentStore";
import { DocumentStore } from "../../DocumentStore";
import type { BinaryResourceDependencies } from "./BinaryResource";
import { BinaryResource } from "./BinaryResource";

export interface BinaryResourceStoreDependencies
  extends DocumentStoreDependencies,
    BinaryResourceDependencies {}

export class BinaryResourceStore extends DocumentStore<
  BinaryResource,
  string,
  BinaryResourceStoreDependencies
> {
  protected create(
    initializer: string,
    documentGetterOptions: DocumentGetterOptions,
  ) {
    return new BinaryResource(initializer, {
      ...this.dependencies,
      documentGetterOptions,
    });
  }

  protected normalizeInitializer(initializer: string): string {
    return BinaryResource.normalizeUri(initializer);
  }
}
