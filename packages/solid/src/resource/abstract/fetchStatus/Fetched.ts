import type { AbsentContainer } from "../../concrete/AbsentContainer";
import type { AbsentLeaf } from "../../concrete/AbsentLeaf";
import type { BinaryLeaf } from "../../concrete/BinaryLeaf";
import type { BranchContainer } from "../../concrete/BranchContainer";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { RootContainer } from "../../concrete/RootContainer";
import { FetchStatus } from "./FetchStatus";

export type FetchedClass =
  | RootContainer
  | BranchContainer
  | DataLeaf
  | BinaryLeaf
  | AbsentContainer
  | AbsentLeaf;
export abstract class Fetched extends FetchStatus {
  public get didInitialFetch(): true {
    return true;
  }
}
