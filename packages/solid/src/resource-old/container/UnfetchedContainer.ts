import type { Unfetched } from "../types";
import { Container } from "./Container";

export class UnfetchedContainer extends Container implements Unfetched {
  get isBinary(): undefined {
    return undefined;
  }
  get isDataResource(): undefined {
    return undefined;
  }
  get isRootContainer(): undefined {
    return undefined;
  }
  get isBranchContainer(): undefined {
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
}
