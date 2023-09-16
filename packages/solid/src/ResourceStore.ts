import { Container } from "./resource/Container";
import { Leaf } from "./resource/Leaf";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import type { ContainerUri, LeafUri } from "./util/uriTypes";
import { isContainerUri } from "./util/uriTypes";

export interface ResourceGetterOptions {
  autoLoad?: boolean;
}

export class ResourceStore {
  protected resourceMap: Map<string, Leaf | Container>;
  protected context: SolidLdoDatasetContext;

  constructor(context: SolidLdoDatasetContext) {
    this.resourceMap = new Map();
    this.context = context;
  }

  get(uri: ContainerUri, options?: ResourceGetterOptions): Container;
  get(uri: LeafUri, options?: ResourceGetterOptions): Leaf;
  get(uri: string, options?: ResourceGetterOptions): Leaf | Container;
  get(uri: string, options?: ResourceGetterOptions): Leaf | Container {
    // Normalize URI by removing hash
    const url = new URL(uri);
    url.hash = "";
    const normalizedUri = url.toString();

    // Get the document and return if exists
    let resource = this.resourceMap.get(normalizedUri);
    if (!resource) {
      if (isContainerUri(normalizedUri)) {
        resource = new Container(normalizedUri, this.context);
      } else {
        resource = new Leaf(normalizedUri as LeafUri, this.context);
      }
      this.resourceMap.set(normalizedUri, resource);
    }

    if (options?.autoLoad) {
      resource.read();
    }

    return resource;
  }
}
