import {
  DocumentStore,
  DocumentStoreDependencies,
} from "../../../DocumentStore";
import { Resource } from "../../Resource";
import {
  ContainerResource,
  ContainerResourceDependencies,
} from "./ContainerResource";

export interface ContainerResourceStoreDependencies
  extends ContainerResourceDependencies,
    DocumentStoreDependencies {}

export class ContainerResourceStore extends DocumentStore<
  ContainerResource,
  string,
  ContainerResourceStoreDependencies
> {
  protected create(initializer: string) {
    return new ContainerResource(initializer, this.dependencies);
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
