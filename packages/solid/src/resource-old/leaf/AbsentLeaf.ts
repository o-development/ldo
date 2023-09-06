import type {
  Absent,
  FetchedLeaf,
  LdoSolidError,
  PotentialBinary,
  PotentialData,
} from "../types";
import { Leaf } from "./Leaf";
import type { BinaryLeaf } from "./presentLeaf/BinaryLeaf";
import type { DataLeaf } from "./presentLeaf/DataLeaf";
import type { PresentLeafClass } from "./presentLeaf/PresentLeaf";

export class AbsentLeaf
  extends Leaf
  implements Absent, PotentialBinary, PotentialData, FetchedLeaf
{
  get isBinary(): false {
    return false;
  }
  get isDataResource(): false {
    return false;
  }
  get isPresent(): false {
    return false;
  }
  get isAbsent(): true {
    return true;
  }
  get isUnfetched(): false {
    return false;
  }

  async getIsRootContainer(): Promise<false> {
    return false;
  }

  async upload(_blob: Blob): Promise<BinaryLeaf | LdoSolidError> {
    throw new Error("Not Implemented");
  }
  uploadIfAbsent(_blob: Blob): Promise<BinaryLeaf | LdoSolidError> {
    throw new Error("Method not implemented.");
  }
  uploadOrOverwrite(_blob: Blob): Promise<BinaryLeaf | LdoSolidError> {
    throw new Error("Method not implemented.");
  }

  async create(): Promise<DataLeaf | LdoSolidError> {
    throw new Error("Not Implemented");
  }
  createIfAbsent(): Promise<LdoSolidError | PresentLeafClass> {
    throw new Error("Method not implemented.");
  }
  createOrOverwrite(): Promise<LdoSolidError | DataLeaf> {
    throw new Error("Method not implemented.");
  }
}
