import { Mixin } from "ts-mixer";
import { Absent, AbsentClass } from "../abstract/fetchStatus/Absent";
import { FetchedLeaf, FetchedLeafClass } from "../abstract/leaf/FetchedLeaf";
import { FetchedClass } from "../abstract/fetchStatus/Fetched";
import { PresentClass } from "../abstract/fetchStatus/Present";
import { SolidLdoError } from "../error/SolidLdoError";

export class AbsentLeaf extends Mixin(Absent, FetchedLeaf) {
  create(...args: unknown[]): Promise<PresentClass | SolidLdoError> {
    throw new Error("Method not implemented.");
  }
  read(): Promise<SolidLdoError | FetchedLeafClass> {
    throw new Error("Method not implemented.");
  }
  createOrOverride(): Promise<PresentClass | SolidLdoError> {
    throw new Error("Method not implemented.");
  }
  deleteIfPresent(): Promise<SolidLdoError | AbsentClass> {
    throw new Error("Method not implemented.");
  }
}
