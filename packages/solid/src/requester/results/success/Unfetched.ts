import type { ResourceSuccess } from "./SuccessResult";

export interface Unfetched extends ResourceSuccess {
  type: "unfetched";
}
