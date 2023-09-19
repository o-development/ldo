import { ResourceSuccess } from "./SuccessResult";

export class CheckRootContainerSuccess extends ResourceSuccess {
  readonly type = "checkRootContainerSuccess" as const;
  readonly isRootContainer: boolean;

  constructor(uri: string, isRootContainer: boolean) {
    super(uri);
    this.isRootContainer = isRootContainer;
  }
}
