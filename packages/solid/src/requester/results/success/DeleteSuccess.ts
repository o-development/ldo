import { ResourceSuccess } from "./SuccessResult";

export class DeleteSuccess extends ResourceSuccess {
  readonly type = "deleteSuccess" as const;
  readonly resourceExisted: boolean;

  constructor(uri: string, resourceExisted: boolean) {
    super(uri);
    this.resourceExisted = resourceExisted;
  }
}
