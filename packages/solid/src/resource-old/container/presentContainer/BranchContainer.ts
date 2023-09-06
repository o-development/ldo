import { PresentContainer } from "./PresentContainer";

export class BranchContainer extends PresentContainer {
  get isRootContainer(): false {
    return false;
  }
  get isBranchContainer(): true {
    return true;
  }

  async getIsRootContainer(): Promise<false> {
    return false;
  }

  getCurrent(): this {
    throw new Error("Method not implemented.");
  }
}
