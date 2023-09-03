import type { DocumentGetterOptions } from "../../../DocumentStore";
import { DocumentStore } from "../../../DocumentStore";
import type { Resource } from "../../Resource";
import { ContainerResource } from "./ContainerResource";

export class ContainerResourceStore extends DocumentStore<
  ContainerResource,
  string
> {
  protected create(
    initializer: string,
    documentGetterOptions?: DocumentGetterOptions,
  ) {
    return new ContainerResource(
      initializer,
      this.context,
      documentGetterOptions,
    );
  }

  protected normalizeInitializer(initializer: string) {
    return ContainerResource.normalizeUri(initializer);
  }

  getContainerForResouce(resource: Resource) {
    const parentUri = ContainerResourceStore.getParentUri(resource.uri);
    return parentUri ? this.get(parentUri) : undefined;
  }

  /**
   * Returns the parent container URI
   */
  static getParentUri(uri: string) {
    const urlObject = new URL(uri);
    const pathItems = urlObject.pathname.split("/");
    if (
      pathItems.length < 2 ||
      (pathItems.length === 2 && pathItems[1].length === 0)
    ) {
      return undefined;
    }
    if (pathItems[pathItems.length - 1] === "") {
      pathItems.pop();
    }
    pathItems.pop();
    urlObject.pathname = `${pathItems.join("/")}/`;
    return urlObject.toString();
  }
}
