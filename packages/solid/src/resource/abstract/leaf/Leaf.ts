import type { AbsentLeaf } from "../../concrete/AbsentLeaf";
import type { BinaryLeaf } from "../../concrete/BinaryLeaf";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { UnfetchedLeaf } from "../../concrete/UnfetchedLeaf";
import { SolidLdoError } from "../../error/SolidLdoError";
import { Resource, ResourceClass } from "../Resource";
import { FetchedClass } from "../fetchStatus/Fetched";
import { PresentClass } from "../fetchStatus/Present";
import type { FetchedLeafClass } from "./FetchedLeaf";
import { PresentLeafClass } from "./PresentLeaf";

export type LeafClass = DataLeaf | BinaryLeaf | AbsentLeaf | UnfetchedLeaf;
export abstract class Leaf extends Resource {
  async read(): Promise<FetchedLeafClass | SolidLdoError> {
    // Make query
    // Select the Kind of Leaf
    // Create it

    // Post Processing
    throw new Error("Not Implemented");
  }

  async createIfAbsent(): Promise<DataLeaf | SolidLdoError>;
  async createIfAbsent(blob: Blob): Promise<BinaryLeaf | SolidLdoError>;
  async createIfAbsent(_blob?: Blob): Promise<PresentLeafClass | SolidLdoError> {
    
    return new SolidLdoError();
  }

  getCurrent(): LeafClass {
    throw new Error("Not Implemented");
  }
}
