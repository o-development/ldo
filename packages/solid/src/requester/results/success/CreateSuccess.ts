import { ResourceSuccess } from "./SuccessResult";

export class CreateSuccess extends ResourceSuccess {
  readonly type = "createSuccess";
  readonly didOverwrite: boolean;

  constructor(uri: string, didOverwrite: boolean) {
    super(uri);
    this.didOverwrite = didOverwrite;
  }
}
