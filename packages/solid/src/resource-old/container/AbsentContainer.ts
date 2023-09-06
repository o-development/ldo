import type { Absent, FetchedContainer } from "../types";
import type { LdoSolidError } from "../types";
import { Container } from "./Container";
import type { PresentContainerClass } from "./presentContainer/PresentContainer";

export class AbsentContainer
  extends Container
  implements Absent, FetchedContainer
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
  get isRootContainer(): false {
    return false;
  }
  get isBranchContainer(): true {
    return true;
  }

  async getIsRootContainer(): Promise<false> {
    return false;
  }

  async create(): Promise<PresentContainerClass | LdoSolidError> {
    throw new Error("Not Implemented");
  }
}
