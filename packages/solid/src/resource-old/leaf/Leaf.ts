import type { FetchedLeafClass, LdoSolidError, Resource } from "../types";
import type { AbsentLeaf } from "./AbsentLeaf";
import type { UnfetchedLeaf } from "./UnfetchedLeaf";
import type { BinaryLeaf } from "./presentLeaf/BinaryLeaf";
import type { DataLeaf } from "./presentLeaf/DataLeaf";

export type LeafClass = UnfetchedLeaf | AbsentLeaf | BinaryLeaf | DataLeaf;

export abstract class Leaf implements Resource {
  abstract get isBinary(): boolean | undefined;
  abstract get isDataResource(): boolean | undefined;
  abstract get isPresent(): boolean;
  abstract get isAbsent(): boolean;
  abstract get isUnfetched(): boolean;

  uri: string;
  isLoading: boolean;

  read(): Promise<FetchedLeafClass | LdoSolidError> {
    throw new Error("Not Implemented");
  }
  reload(): Promise<FetchedLeafClass | LdoSolidError> {
    return this.read();
  }
  load(): Promise<FetchedLeafClass | LdoSolidError> {
    return this.read();
  }
  getCurrent(): LeafClass {
    throw new Error("Not Implemented");
  }

  async createOrOverwrite(): Promise<DataLeaf | LdoSolidError> {
    throw new Error("Not Implemented");
  }
  async uploadOrOverwrite(_blob: Blob): Promise<BinaryLeaf | LdoSolidError> {
    throw new Error("Method not implemented.");
  }
}
