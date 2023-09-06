import type { FetchedLeaf, Present } from "../../types";
import { Leaf } from "../Leaf";
import type { BinaryLeaf } from "./BinaryLeaf";
import type { DataLeaf } from "./DataLeaf";

export type PresentLeafClass = DataLeaf | BinaryLeaf;
export abstract class PresentLeaf extends Leaf implements Present, FetchedLeaf {
  get isPresent(): true {
    return true;
  }
  get isAbsent(): false {
    return false;
  }
  get isUnfetched(): false {
    return false;
  }
}
