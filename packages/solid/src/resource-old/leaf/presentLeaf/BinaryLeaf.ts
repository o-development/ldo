import type { LdoSolidError, PotentialBinary } from "../../types";
import { PresentLeaf } from "./PresentLeaf";

export class BinaryLeaf extends PresentLeaf implements PotentialBinary {
  get isBinary(): true {
    return true;
  }
  get isDataResource(): false {
    return false;
  }

  uploadIfAbsent(_blob: Blob): Promise<LdoSolidError | BinaryLeaf> {
    throw new Error("Method not implemented.");
  }
}
