import type { ResourceSuccess } from "./SuccessResult";

export interface CreateSuccess extends ResourceSuccess {
  type: "createSuccess";
  didOverwrite: boolean;
}
