import type { AbsentContainer } from "../../concrete/AbsentContainer";
import type { AbsentLeaf } from "../../concrete/AbsentLeaf";
import type { SolidLdoError } from "../../error/SolidLdoError";
import { Fetched } from "./Fetched";
import type { PresentClass } from "./Present";

export type AbsentClass = AbsentContainer | AbsentLeaf;
export abstract class Absent extends Fetched {
  public get isAbsent(): true {
    return true;
  }
  public get isPresent(): false {
    return false;
  }

  abstract create(...args: unknown[]): Promise<PresentClass | SolidLdoError>;
}
