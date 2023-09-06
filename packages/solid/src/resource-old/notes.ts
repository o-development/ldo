const thing = {
  "RootContainerResource|ContainerResource|ChildDataResource|BinaryResource|AbsentContainerResource|AbsentChildDataResource|AbsentBinaryResource|UnfetchedContainerResource|UnfetchedChildDataResource|UnfetchedBinaryResource|":
    ["uri", "isLoading", "didInitialFetch", "read", "reload", "load"],
  "RootContainerResource|ContainerResource|ChildDataResource|": ["ldoDataset"],
  "RootContainerResource|ContainerResource|AbsentContainerResource|UnfetchedContainerResource|":
    [
      "getIsRootContainer",
      "createContainerIn",
      "createDataResourceIn",
      "uploadBinaryIn",
      "clearIfPresent",
    ],
  "RootContainerResource|ContainerResource|ChildDataResource|AbsentContainerResource|AbsentChildDataResource|UnfetchedContainerResource|UnfetchedChildDataResource|UnfetchedBinaryResource|":
    ["createOrOverwrite"],
  "RootContainerResource|ContainerResource|": ["clear"],
  "ContainerResource|ChildDataResource|AbsentContainerResource|AbsentChildDataResource|AbsentBinaryResource|UnfetchedChildDataResource|UnfetchedBinaryResource|":
    ["parentContainer"],
  "ContainerResource|ChildDataResource|BinaryResource|AbsentContainerResource|AbsentChildDataResource|AbsentBinaryResource|UnfetchedContainerResource|UnfetchedChildDataResource|UnfetchedBinaryResource|":
    ["getParentContainer", "getRootContainer"],
  "ContainerResource|": ["childResources"],
  "ContainerResource|ChildDataResource|BinaryResource|": ["delete"],
  "ContainerResource|ChildDataResource|BinaryResource|AbsentContainerResource|AbsentChildDataResource|AbsentBinaryResource|UnfetchedChildDataResource|UnfetchedBinaryResource|":
    ["deleteIfPresent"],
  "ChildDataResource|": ["hasData"],
  "BinaryResource|": ["mimeType", "fileExtension"],
  "BinaryResource|AbsentBinaryResource|UnfetchedBinaryResource|": [
    "uploadOrOverwrite",
  ],
  "AbsentContainerResource|AbsentChildDataResource|": ["create"],
  "AbsentContainerResource|AbsentChildDataResource|UnfetchedContainerResource|UnfetchedChildDataResource|":
    ["createIfAbsent"],
  "AbsentBinaryResource|": ["upload"],
  "AbsentBinaryResource|UnfetchedBinaryResource|": ["uploadIfAbsent"],
};

import { LdoDataset } from "@ldo/ldo";
import { Quad } from "@rdfjs/types";
import { create } from "domain";
import { URL } from "url";
import { SolidLdoDataset } from "../SolidLdoDataset";

export type ResourceStatus = BinaryResourceStatus | DataResourceStatus | ErrorResource | ErrorResourceStatus;

export type BinaryResourceStore;

/**
 * Method and information definitions
 */
export interface IResource {
  id: URL;
  isDataResource: true,

}

/**
 * Abstract Definitions
 */
export interface IDataResource extends IResource {
  isDataResource: true;
}

export interface IContainerResource extends IResource {
  otherMethod(): void;
}

/**
 * Concrete Definitions
 */

clearIfPresent

export interface BinaryResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: true;
  mimeType: string;
  fileExtension: string;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError>;
  uploadOrOverwrite(blob: Blob): Promise<BinaryResource | LdoSolidError>;
  read(): Promise<BinaryResource | LdoSolidError>;
  reload(): Promise<BinaryResource | LdoSolidError>;
  load(): Promise<BinaryResource | LdoSolidError>;
  delete(): Promise<AbsentBinaryResource | LdoSolidError>;
  deleteIfPresent(): Promise<AbsentBinaryResource | LdoSolidError>;
}

export interface RootContainerResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: true;
  ldoDataset(): LdoDataset;
  getIsRootContainer(): Promise<boolean>;
  createContainerIn(relativeUri: string): Promise<ContainerResource | LdoSolidError>;
  createDataResourceIn(relativeUri: string): Promise<DataResource | LdoSolidError>;
  uploadBinaryIn(relativeUri, blob: Blob): Promise<BinaryResource | LdoSolidError>;
  createOrOverwrite(): Promise<RootContainerResource | LdoSolidError>;
  read(): Promise<RootContainerResource | LdoSolidError>;
  reload(): Promise<RootContainerResource | LdoSolidError>;
  load(): Promise<RootContainerResource | LdoSolidError>;
  clear(): Promise<RootContainerResource | LdoSolidError>;
  clearIfPresent(): Promise<RootContainerResource | LdoSolidError>;
}

export interface ContainerResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: true;
  parentContainer: ContainerResource | RootContainerResource;
  getIsRootContainer(): Promise<boolean>;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError>;
  childResources: ContainerResource | DataResource | BinaryResource | UnfetchedContainerResource | UnfetchedDataResource | UnfetchedBinaryResource;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  createContainerIn(relativeUri: string): Promise<ContainerResource | LdoSolidError>;
  createDataResourceIn(relativeUri: string): Promise<DataResource | LdoSolidError>;
  uploadBinaryIn(relativeUri, blob: Blob): Promise<BinaryResource | LdoSolidError>;
  ldoDataset(): LdoDataset;
  createOrOverwrite(): Promise<ContainerResource | LdoSolidError>;
  read(): Promise<ContainerResource | LdoSolidError>;
  reload(): Promise<ContainerResource | LdoSolidError>;
  load(): Promise<ContainerResource | LdoSolidError>;
  delete(): Promise<AbsentContainerResource | LdoSolidError>;
  deleteIfPresent(): Promise<ContainerResource | LdoSolidError>;
  clear(): Promise<ContainerResource | LdoSolidError>;
  clearIfPresent(): Promise<ContainerResource | LdoSolidError>;
}

export interface DataResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: true;
  parentContainer: ContainerResource | RootContainerResource;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError>;
  hasData(): boolean;
  ldoDataset(): LdoDataset;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  createOrOverwrite(): Promise<DataResource | LdoSolidError>;
  read(): Promise<DataResource | LdoSolidError>;
  reload(): Promise<DataResource | LdoSolidError>;
  load(): Promise<DataResource | LdoSolidError>;
  delete(): Promise<AbsentDataResource | LdoSolidError>;
  deleteIfPresent(): Promise<AbsentBinaryResource | LdoSolidError>;
}

export interface AbsentDataResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: true;
  parentContainer: ContainerResource | RootContainerResource;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError>;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  createOrOverwrite(): Promise<DataResource | LdoSolidError>;
  create(): Promise<DataResource | LdoSolidError>;
  createIfAbsent(): Promise<DataResource | LdoSolidError>;
  read(): Promise<DataResource | LdoSolidError>;
  reload(): Promise<DataResource | LdoSolidError>;
  load(): Promise<DataResource | LdoSolidError>;
  deleteIfPresent(): Promise<AbsentBinaryResource | LdoSolidError>;
}

export interface AbsentBinaryResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: true;
  parentContainer: ContainerResource | RootContainerResource;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError>;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  uploadOrOverwrite(blob: Blob): Promise<BinaryResource | LdoSolidError>;
  upload(blob: Blob): Promise<BinaryResource | LdoSolidError>;
  uploadIfAbsent(blob: Blob): Promise<BinaryResource | BinaryResource>;
  read(): Promise<BinaryResource | LdoSolidError>;
  reload(): Promise<BinaryResource | LdoSolidError>;
  load(): Promise<BinaryResource | LdoSolidError>;
  deleteIfPresent(): Promise<AbsentBinaryResource | LdoSolidError>;
}

export interface AbsentContainerResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: true;
  parentContainer: ContainerResource | RootContainerResource;
  getIsRootContainer(): Promise<boolean>;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError>;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  createContainerIn(relativeUri: string): Promise<ContainerResource | LdoSolidError>;
  createDataResourceIn(relativeUri: string): Promise<DataResource | LdoSolidError>;
  uploadBinaryIn(relativeUri, blob: Blob): Promise<BinaryResource | LdoSolidError>;
  createOrOverwrite(): Promise<ContainerResource | LdoSolidError>;
  create(): Promise<ContainerResource | LdoSolidError>;
  createIfAbsent(): Promise<ContainerResource | LdoSolidError>;
  read(): Promise<ContainerResource | LdoSolidError>;
  reload(): Promise<ContainerResource | LdoSolidError>;
  load(): Promise<ContainerResource | LdoSolidError>;
  deleteIfPresent(): Promise<AbsentContainerResource | LdoSolidError>;
  clearIfPresent(): Promise<AbsentContainerResource | LdoSolidError>;
}

export interface UnfetchedDataResource {
  parentContainer: ContainerResource | RootContainerResource;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError>;
  uri: string;
  isLoading: boolean;
  didInitialFetch: false;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  createOrOverwrite(): Promise<DataResource | LdoSolidError>;
  createIfAbsent(): Promise<DataResource | LdoSolidError>;
  read(): Promise<BinaryResource | LdoSolidError>;
  reload(): Promise<BinaryResource | LdoSolidError>;
  load(): Promise<BinaryResource | LdoSolidError>;
  deleteIfPresent(): Promise<AbsentBinaryResource | LdoSolidError>;
}

export interface UnfetchedBinaryResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: false;
  parentContainer: ContainerResource | RootContainerResource;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError>;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  uploadOrOverwrite(blob: Blob): Promise<BinaryResource | LdoSolidError>
  createOrOverwrite(): Promise<BinaryResource | LdoSolidError>;
  uploadIfAbsent(blob: Blob): Promise<BinaryResource | BinaryResource>;
  read(): Promise<BinaryResource | LdoSolidError>;
  reload(): Promise<BinaryResource | LdoSolidError>;
  load(): Promise<BinaryResource | LdoSolidError>;
  deleteIfPresent(): Promise<AbsentBinaryResource | LdoSolidError>;
}

export interface UnfetchedContainerResource {
  uri: string;
  isLoading: boolean;
  didInitialFetch: false;
  getIsRootContainer(): Promise<boolean>;
  getParentContainer(): Promise<RootContainerResource | ContainerResource | LdoSolidError | undefined>;
  getRootContainer(): Promise<RootContainerResource | LdoSolidError>;
  createContainerIn(relativeUri: string): Promise<ContainerResource | LdoSolidError>;
  createDataResourceIn(relativeUri: string): Promise<DataResource | LdoSolidError>;
  uploadBinaryIn(relativeUri, blob: Blob): Promise<BinaryResource | LdoSolidError>;
  createOrOverwrite(): Promise<ContainerResource | LdoSolidError>;
  createIfAbsent(): Promise<ContainerResource | LdoSolidError>;
  read(): Promise<ContainerResource | RootContainerResource | LdoSolidError>;
  reload(): Promise<ContainerResource | RootContainerResource | LdoSolidError>;
  load(): Promise<ContainerResource | RootContainerResource | LdoSolidError>;
  clearIfPresent(): Promise<ContainerResource | AbsentContainerResource | LdoSolidError>;
}

export interface LdoSolidError extends Error {
  forResource: unknown // Some Kind of Resource
}
