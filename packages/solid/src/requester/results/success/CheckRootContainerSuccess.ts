import type { ResourceSuccess } from "./SuccessResult";

export interface CheckRootContainerSuccess extends ResourceSuccess {
  type: "checkRootContainerSuccess";
  isRootContainer: boolean;
}
