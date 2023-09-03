import { LdoDataset } from "@ldo/ldo";
import type { DataResource } from "./document/resource/dataResource/DataResource";
import type { ContainerResource } from "./document/resource/dataResource/containerResource/ContainerResource";
import type { AccessRules } from "./document/accessRules/AccessRules";
import type { BinaryResource } from "./document/resource/binaryResource/BinaryResource";
import type { DocumentGetterOptions } from "./document/DocumentStore";
import type { Dataset, DatasetFactory } from "@rdfjs/types";
import type { Resource } from "./document/resource/Resource";
import type {
  OnDocumentErrorCallback,
  SolidLdoDatasetContext,
} from "./SolidLdoDatasetContext";

export class SolidLdoDataset extends LdoDataset {
  public context: SolidLdoDatasetContext;

  constructor(
    context: SolidLdoDatasetContext,
    datasetFactory: DatasetFactory,
    initialDataset?: Dataset,
  ) {
    super(datasetFactory, initialDataset);
    this.context = context;
  }

  getDataResource(uri: string, options?: DocumentGetterOptions): DataResource {
    return this.context.dataResourceStore.get(uri, options);
  }

  getContainerResource(
    uri: string,
    options?: DocumentGetterOptions,
  ): ContainerResource {
    return this.context.containerResourceStore.get(uri, options);
  }

  getAccessRules(
    forResource: string | Resource,
    options?: DocumentGetterOptions,
  ): AccessRules {
    const resourceIdentifier =
      typeof forResource === "string"
        ? this.getDataResource(forResource)
        : forResource;
    return this.context.accessRulesStore.get(resourceIdentifier, options);
  }

  getBinaryResource(
    uri: string,
    options?: DocumentGetterOptions,
  ): BinaryResource {
    return this.context.binaryResourceStore.get(uri, options);
  }

  onDocumentError(callback: OnDocumentErrorCallback): void {
    this.context.documentEventEmitter.on("documentError", callback);
  }

  offDocumentError(callback: OnDocumentErrorCallback): void {
    this.context.documentEventEmitter.off("documentError", callback);
  }
}
