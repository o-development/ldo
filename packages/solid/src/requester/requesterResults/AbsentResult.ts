import { RequesterResult } from "./RequesterResult";

export class AbsentResult extends RequesterResult {
  type = "absent" as const;

  static is(response: Response): boolean {
    return response.status === 404;
  }
}
