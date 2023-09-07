import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type { FetchableDocument } from "./FetchableDocument";
import type { ResourceClass } from "./resource/abstract/AbstractResource";
import type { ContainerClass } from "./resource/abstract/container/Container";
import type { LeafClass } from "./resource/abstract/leaf/Leaf";
import { UnfetchedContainer } from "./resource/concrete/UnfetchedContainer";
import { UnfetchedLeaf } from "./resource/concrete/UnfetchedLeaf";
import { ContainerUri, LeafUri, isContainerUri } from "./uriTypes";

export interface ResourceGetterOptions {
  autoLoad?: boolean;
}

export class ResourceStore {
  protected resourceMap: Map<string, ResourceClass>;
  protected context: SolidLdoDatasetContext;

  constructor(context: SolidLdoDatasetContext) {
    this.documentMap = new Map();
    this.context = context;
  }

  get(uri: ContainerUri, options?: ResourceGetterOptions): ContainerClass;
  get(uri: LeafUri, options?: ResourceGetterOptions): LeafClass;
  get(uri: string, options?: ResourceGetterOptions): ResourceClass;
  get(uri: string, options?: ResourceGetterOptions): ResourceClass {
    // Normalize URI by removing hash
    const url = new URL(uri);
    url.hash = "";
    const normalizedUri = url.toString();

    // Get the document and return if exists
    let resource = this.resourceMap.get(normalizedUri);
    if (!resource) {
      if (isContainerUri(normalizedUri)) {
        resource = new UnfetchedContainer();
      } else {
        resource = new UnfetchedLeaf();
      }
      this.resourceMap.set(normalizedUri, resource);
    }

    if (options?.autoLoad) {
      resource.read();
    }

    return resource;


    throw new Error("Not Implemented");
    // const initializer = this.normalizeInitializer(initializerInput);
    // const document = this.documentMap.get(initializer);
    // if (document) {
    //   if (options?.autoLoad) {
    //     document.read();
    //   }
    //   return document;
    // }
    // const newDocument = this.create(initializer, options);
    // this.documentMap.set(initializer, newDocument);
    // return newDocument;
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const resourceStore = new ResourceStore();

const container = resourceStore.get("https://jackson.com/");
const leaf = resourceStore.get("https://jackson.com/item.ttl");
const thing: string = "https://jackson.com/";
const resource = resourceStore.get(thing);
