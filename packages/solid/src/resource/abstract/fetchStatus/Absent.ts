import type { AbsentContainer } from "../../concrete/AbsentContainer";
import type { AbsentLeaf } from "../../concrete/AbsentLeaf";
import { Fetched } from "./Fetched";

export type AbsentClass = AbsentContainer | AbsentLeaf;
export class Absent extends Fetched {
  public get isAbsent(): true {
    return true;
  }
  public get isPresent(): false {
    return false;
  }
}
