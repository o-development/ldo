import type { DocumentGetterOptions } from "../../DocumentStore";
import { DocumentStore } from "../../DocumentStore";
import { BinaryResource } from "./BinaryResource";

export class BinaryResourceStore extends DocumentStore<BinaryResource, string> {
  protected create(
    initializer: string,
    documentGetterOptions?: DocumentGetterOptions,
  ) {
    return new BinaryResource(initializer, this.context, documentGetterOptions);
  }

  protected normalizeInitializer(initializer: string): string {
    return BinaryResource.normalizeUri(initializer);
  }
}
