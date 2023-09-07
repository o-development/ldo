// import type { LdoDataset } from "@ldo/ldo";
// import type { LeafMethodNotAllowedError } from "./error/MethodNotAllowedError";
// import type { DatasetChanges } from "@ldo/rdf-utils";
// import type { PresentContainer } from "./abstract/container/PresentContainer";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type { LeafUri } from "../uriTypes";
import { Resource } from "./Resource";

export interface ConcreteInstance {
  uri: LeafUri;
  context: SolidLdoDatasetContext;
  // methods: typeof AbstractLeaf;
}

// REMEMBER: This file should be replaced with non abstract methods
export abstract class ConcreteLeaf extends Resource {
  // // All intance variables
  // private readonly i: SolidLdoDatasetContext;
  // uri: string;
  // abstract type(): LeafType["type"];
  // // Loading Methods
  // isLoading(): boolean {
  //   return (
  //     this.isCreating() ||
  //     this.isReading() ||
  //     this.isUpdating() ||
  //     this.isDeletinng()
  //   );
  // }
  // abstract isCreating(): boolean;
  // abstract isReading(): boolean;
  // abstract isUpdating(): boolean;
  // abstract isDeletinng(): boolean;
  // isDoingInitialFetch(): boolean {
  //   return this.isReading() && !this.didInitialFetch();
  // }
  // // Checkers
  // abstract didInitialFetch(): boolean;
  // abstract isFetched(): boolean;
  // abstract isUnfetched(): boolean;
  // abstract isBinary: boolean | undefined;
  // abstract isDataResource(): boolean | undefined;
  // // Read Methods
  // abstract read(): Promise<PresentLeafType | LdoSolidError>;
  // abstract readIfUnfetched(): Promise<PresentLeafType | LdoSolidError>;
  // // Create Methods
  // abstract createOrOverwrite(): Promise<DataLeaf | LdoSolidError>;
  // abstract createOrOverwrite(blob: Blob): Promise<BinaryLeaf | LdoSolidError>;
  // abstract createIfAbsent(): Promise<LeafType | LdoSolidError>;
  // abstract createIfAbsent(blob: Blob): Promise<LeafType | LdoSolidError>;
  // // Delete Method
  // abstract delete(): Promise<AbsentLeaf | LdoSolidError>;
  // // Parent Container Methods -- Remember to change for Container
  // abstract getCachedParentContainer(): ContainerType | LdoSolidError;
  // abstract getParentContainer(): Promise<PresentContainer | LdoSolidError>;
  // abstract reloadParentContainer(): Promise<PresentContainer | LdoSolidError>;
  // abstract getRootContainerFromCache():
  //   | ContainerType
  //   | undefined
  //   | LdoSolidError;
  // abstract getRootContainer(): Promise<
  //   FetchedContainerType | undefined | LdoSolidError
  // >;
  // abstract getRootContainerFromPod(): Promise<
  //   FetchedContainerType | undefined | LdoSolidError
  // >;
  // // Exclusing Methods =========================================================
  // // Data Methods (Data Leaf Only)
  // abstract getLdoDataset(): LdoDataset | LeafMethodNotAllowedError;
  // abstract reloadLdoDataset(): Promise<LdoDataset | LeafMethodNotAllowedError>;
  // abstract hasData(): boolean | LeafMethodNotAllowedError;
  // abstract reloadHasData(): Promise<boolean | LeafMethodNotAllowedError>;
  // abstract update(
  //   changes: DatasetChanges,
  // ): Promise<DataLeaf | LdoSolidError | LeafMethodNotAllowedError>;
  // // Binary Methods (Binary Only)
  // abstract getMimeType(): string | LeafMethodNotAllowedError;
  // abstract reloadMimeType(): Promise<string | LeafMethodNotAllowedError>;
  // // Create Methods (AbsentLeaf Only)
  // abstract create(): Promise<
  //   DataLeaf | LdoSolidError | LeafMethodNotAllowedError
  // >;
  // abstract create(
  //   blob: Blob,
  // ): Promise<BinaryLeaf | LdoSolidError | LeafMethodNotAllowedError>;
}
