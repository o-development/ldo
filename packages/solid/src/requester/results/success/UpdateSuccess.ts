import type { ResourceSuccess } from "./SuccessResult";

export interface UpdateSuccess extends ResourceSuccess {
  type: "updateSuccess";
}
