import type {
  FetchedContainerClass,
  LdoSolidError,
  PotentialContainer,
  Resource,
} from "../types";
import type { AbsentContainer } from "./AbsentContainer";
import type { UnfetchedContainer } from "./UnfetchedContainer";
import type { BranchContainer } from "./presentContainer/BranchContainer";
import type { RootContainer } from "./presentContainer/RootContainer";
import type { DataLeaf } from "../leaf/presentLeaf/DataLeaf";
import type { BinaryLeaf } from "../leaf/presentLeaf/BinaryLeaf";
import type { PresentContainerClass } from "./presentContainer/PresentContainer";

export type ContainerClass =
  | BranchContainer
  | RootContainer
  | AbsentContainer
  | UnfetchedContainer;

export abstract class Container implements Resource, PotentialContainer {
  abstract get isRootContainer(): boolean | undefined;
  abstract get isBranchContainer(): boolean | undefined;
  abstract get isPresent(): boolean;
  abstract get isAbsent(): boolean;
  abstract get isUnfetched(): boolean;
  abstract get isBinary(): boolean | undefined;
  abstract get isDataResource(): boolean | undefined;

  uri: string;
  isLoading: boolean;

  read(): Promise<FetchedContainerClass | LdoSolidError> {
    throw new Error("Not Implemented");
  }
  reload(): Promise<FetchedContainerClass | LdoSolidError> {
    return this.read();
  }
  load(): Promise<FetchedContainerClass | LdoSolidError> {
    return this.read();
  }
  getCurrent(): ContainerClass {
    throw new Error("Method not implemented.");
  }

  abstract getIsRootContainer(): Promise<boolean>;

  createContainerIn(
    _relativeUri: string,
  ): Promise<BranchContainer | LdoSolidError> {
    throw new Error("Not Implemented");
  }

  createLeafDataResourceIn(
    _relativeUri: string,
  ): Promise<DataLeaf | LdoSolidError> {
    throw new Error("Not Implemented");
  }

  uploadBinaryIn(
    _relativeUri,
    _blob: Blob,
  ): Promise<BinaryLeaf | LdoSolidError> {
    throw new Error("Not Implemented");
  }

  clearIfPresent(): Promise<this | LdoSolidError> {
    throw new Error("Not Implemented");
  }

  createIfAbsent(): Promise<LdoSolidError | PresentContainerClass> {
    throw new Error("Method not implemented.");
  }
  createOrOverwrite(): Promise<LdoSolidError | PresentContainerClass> {
    throw new Error("Method not implemented.");
  }
}
