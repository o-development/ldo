import { PresentContainer } from "./PresentContainer";

export class RootContainer extends PresentContainer {
  get isRootContainer(): true {
    return true;
  }
  get isBranchContainer(): false {
    return false;
  }

  async getIsRootContainer(): Promise<true> {
    return true;
  }
}
