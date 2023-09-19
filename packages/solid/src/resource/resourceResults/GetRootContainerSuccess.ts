import { SuccessResult } from "../../requester/results/success/SuccessResult";
import type { Container } from "../Container";

export class GetRootContainerSuccess extends SuccessResult {
  readonly type = "getRootContainerSuccess" as const;
  readonly rootContainer: Container;

  constructor(rootContainer: Container) {
    super();
    this.rootContainer = rootContainer;
  }
}
