import type {
  LdoSolidError,
  PotentialBinary,
  PotentialData,
  Unfetched,
} from "../types";
import { Leaf } from "./Leaf";
import type { BinaryLeaf } from "./presentLeaf/BinaryLeaf";
import type { DataLeaf } from "./presentLeaf/DataLeaf";
import type { PresentLeaf } from "./presentLeaf/PresentLeaf";

export class UnfetchedLeaf
  extends Leaf
  implements Unfetched, PotentialBinary, PotentialData
{
  get isBinary(): undefined {
    return undefined;
  }
  get isDataResource(): undefined {
    return undefined;
  }
  get isPresent(): false {
    return false;
  }
  get isAbsent(): false {
    return false;
  }
  get isUnfetched(): true {
    return true;
  }

  getIsRootContainer(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  uploadIfAbsent(_blob: Blob): Promise<LdoSolidError | PresentLeaf> {
    throw new Error("Method not implemented.");
  }
  uploadOrOverwrite(_blob: Blob): Promise<LdoSolidError | BinaryLeaf> {
    throw new Error("Method not implemented.");
  }

  createIfAbsent(): Promise<PresentLeaf | LdoSolidError> {
    throw new Error("Method not implemented.");
  }
  createOrOverwrite(): Promise<LdoSolidError | DataLeaf> {
    throw new Error("Method not implemented.");
  }
}
