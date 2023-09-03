import type TypedEmitter from "typed-emitter";
import type { SolidLdoDataset } from "./SolidLdoDataset";
import type { ContainerResourceStore } from "./document/resource/dataResource/containerResource/ContainerResourceStore";
import type { AccessRulesStore } from "./document/accessRules/AccessRulesStore";
import type { DataResourceStore } from "./document/resource/dataResource/DataResourceStore";
import type { BinaryResourceStore } from "./document/resource/binaryResource/BinaryResourceStore";
import type { DocumentError } from "./document/errors/DocumentError";

export type OnDocumentErrorCallback = (error: DocumentError) => void;

export type DocumentEventEmitter = TypedEmitter<{
  documentError: OnDocumentErrorCallback;
}>;

export interface SolidLdoDatasetContext {
  solidLdoDataset: SolidLdoDataset;
  documentEventEmitter: DocumentEventEmitter;
  fetch: typeof fetch;
  accessRulesStore: AccessRulesStore;
  containerResourceStore: ContainerResourceStore;
  dataResourceStore: DataResourceStore;
  binaryResourceStore: BinaryResourceStore;
}
