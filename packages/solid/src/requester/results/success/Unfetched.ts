import { ResourceSuccess } from "./SuccessResult";

export class Unfetched extends ResourceSuccess {
  readonly type = "unfetched" as const;
}
