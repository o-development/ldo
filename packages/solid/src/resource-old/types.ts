import type { LdoDataset } from "@ldo/ldo";
import type { AbsentLeaf } from "./leaf/AbsentLeaf";
import type { UnfetchedLeaf } from "./leaf/UnfetchedLeaf";
import type { BinaryLeaf } from "./leaf/presentLeaf/BinaryLeaf";
import type { BranchContainer } from "./container/presentContainer/BranchContainer";
import type { RootContainer } from "./container/presentContainer/RootContainer";
import type { DataLeaf } from "./leaf/presentLeaf/DataLeaf";
import type { AbsentContainer } from "./container/AbsentContainer";
import type { UnfetchedContainer } from "./container/UnfetchedContainer";
import type { PresentContainerClass } from "./container/presentContainer/PresentContainer";
import type { PresentLeaf } from "./leaf/presentLeaf/PresentLeaf";

export interface LdoSolidError extends Error {}

export type ResouceClass =
  | RootContainer
  | BranchContainer
  | DataLeaf
  | BinaryLeaf
  | AbsentContainer
  | AbsentLeaf
  | UnfetchedContainer
  | UnfetchedLeaf;
export interface Resource {
  uri: string;
  isLoading: boolean;
  isAbsent: boolean;
  isUnfetched: boolean;
  isPresent: boolean;
  isBinary: boolean | undefined;
  isDataResource: boolean | undefined;
}

export type AbsentClass = AbsentContainer | AbsentLeaf;
export interface Absent {
  isAbsent: true;
  isUnfetched: false;
  isPresent: false;
  isBinary: false;
  isDataResource: false;
}

export type UnfetchedClass = UnfetchedContainer | UnfetchedLeaf;
export interface Unfetched {
  isUnfetched: true;
  isAbsent: false;
  isPresent: false;
  isBinary: undefined;
  isDataResource: undefined;
}

export type PresentClass =
  | RootContainer
  | BranchContainer
  | DataLeaf
  | BinaryLeaf;
export interface Present {
  isPresent: true;
  isAbsent: false;
  isUnfetched: false;
}

export type DataResourceClass = BranchContainer | RootContainer;
export interface DataResource {
  isDataResource: true;
  isBinary: false;
  ldoDataset: LdoDataset;
}

export type PotentialBinaryClass = AbsentLeaf | UnfetchedLeaf | BinaryLeaf;
export interface PotentialBinary {
  uploadIfAbsent(blob: Blob): Promise<PresentLeaf | LdoSolidError>;
  uploadOrOverwrite(blob: Blob): Promise<BinaryLeaf | LdoSolidError>;
}

export type PotentialDataClass = AbsentLeaf | UnfetchedLeaf | DataLeaf;
export interface PotentialData {
  createIfAbsent(): Promise<PresentLeaf | LdoSolidError>;
}

export type PotentialContainerClass =
  | RootContainer
  | BranchContainer
  | AbsentContainer
  | UnfetchedContainer;
export interface PotentialContainer {
  createIfAbsent(): Promise<PresentContainerClass | LdoSolidError>;
}

export type FetchedContainerClass =
  | RootContainer
  | BranchContainer
  | AbsentContainer;
export interface FetchedContainer {}

export type FetchedLeafClass = DataLeaf | BinaryLeaf | AbsentLeaf;
export interface FetchedLeaf {}
