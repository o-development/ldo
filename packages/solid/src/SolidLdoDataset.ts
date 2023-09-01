import { LdoDataset } from "@ldo/ldo";
import type { DataResource } from "./document/resource/dataResource/DataResource";
import type { ContainerResource } from "./document/resource/dataResource/containerResource/ContainerResource";
import type { AccessRules } from "./document/accessRules/AccessRules";
import type { BinaryResource } from "./document/resource/binaryResource/BinaryResource";
import type { DocumentGetterOptions } from "./document/DocumentStore";
import type { DataResourceStore } from "./document/resource/dataResource/DataResourceStore";
import type { ContainerResourceStore } from "./document/resource/dataResource/containerResource/ContainerResourceStore";
import type { AccessRulesStore } from "./document/accessRules/AccessRulesStore";
import type { BinaryResourceStore } from "./document/resource/binaryResource/BinaryResourceStore";
import type { Dataset, DatasetFactory } from "@rdfjs/types";
import type { Resource } from "./document/resource/Resource";
import { DocumentError } from "./document/errors/DocumentError";

export interface SolidLdoDatasetArgs {
  dataResourceStore: DataResourceStore;
  containerResourceStore: ContainerResourceStore;
  accessRulesStore: AccessRulesStore;
  binaryResourceStore: BinaryResourceStore;
  initialDataset?: Dataset;
  datasetFactory: DatasetFactory;
}

export class SolidLdoDataset extends LdoDataset {
  protected dataResourceStore: DataResourceStore;
  protected containerResourceStore: ContainerResourceStore;
  protected accessRulesStore: AccessRulesStore;
  protected binaryResourceStore: BinaryResourceStore;

  constructor(args: SolidLdoDatasetArgs) {
    super(args.datasetFactory, args.initialDataset);
    this.dataResourceStore = args.dataResourceStore;
    this.containerResourceStore = args.containerResourceStore;
    this.accessRulesStore = args.accessRulesStore;
    this.binaryResourceStore = args.binaryResourceStore;
  }

  getDataResource(uri: string, options?: DocumentGetterOptions): DataResource {
    return this.dataResourceStore.get(uri, options);
  }

  getContainerResource(
    uri: string,
    options?: DocumentGetterOptions,
  ): ContainerResource {
    return this.containerResourceStore.get(uri, options);
  }

  getAccessRules(
    forResource: string | Resource,
    options?: DocumentGetterOptions,
  ): AccessRules {
    const resourceIdentifier =
      typeof forResource === "string"
        ? this.getDataResource(forResource)
        : forResource;
    return this.accessRulesStore.get(resourceIdentifier, options);
  }

  getBinaryResource(
    uri: string,
    options?: DocumentGetterOptions,
  ): BinaryResource {
    return this.binaryResourceStore.get(uri, options);
  }

  onDocumentError(_callback: (error: DocumentError) => void): void {
    throw new Error("Not Implemented");
  }
}
