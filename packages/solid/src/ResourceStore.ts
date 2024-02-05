import { Container } from "./resource/Container";
import { Leaf } from "./resource/Leaf";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import type { ContainerUri, LeafUri } from "./util/uriTypes";
import { isContainerUri } from "./util/uriTypes";

/**
 * Options for getting a resource
 */
export interface ResourceGetterOptions {
  /**
   * If autoLoad is set to true and the resource is unfetched, `read` will be called.
   *
   * @default false
   */
  autoLoad?: boolean;
}

/**
 * @internal
 * A store of Solid resources
 */
export class ResourceStore {
  /**
   * @internal
   *
   * A mapping between a resource URI and a Solid resource
   */
  protected resourceMap: Map<string, Leaf | Container>;
  /**
   * @internal
   *
   * Context about the SolidLdoDataset
   */
  protected context: SolidLdoDatasetContext;

  /**
   * @param context - A SolidLdoDatasetContext of the parent SolidLdoDataset
   */
  constructor(context: SolidLdoDatasetContext) {
    this.resourceMap = new Map();
    this.context = context;
  }

  /**
   * Gets a resource representation
   *
   * @param uri - The URI of the resource
   * @param options - ResourceGetterOptions
   *
   * @returns The resource representation
   */
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
