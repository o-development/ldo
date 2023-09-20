import type { ResourceSuccess } from "./SuccessResult";

export interface DeleteSuccess extends ResourceSuccess {
  type: "deleteSuccess";
  resourceExisted: boolean;
}
