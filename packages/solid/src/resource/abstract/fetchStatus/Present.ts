import type { BinaryLeaf } from "../../concrete/BinaryLeaf";
import type { BranchContainer } from "../../concrete/BranchContainer";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { RootContainer } from "../../concrete/RootContainer";
import { Fetched } from "./Fetched";

export type PresentClass =
  | RootContainer
  | BranchContainer
  | DataLeaf
  | BinaryLeaf;
export class Present extends Fetched {
  public get isAbsent(): false {
    return false;
  }
  public get isPresent(): true {
    return true;
  }
}
