import { UpdateSuccess } from "../../requester/results/success/UpdateSuccess";
import type { Leaf } from "../Leaf";

export class UpdateResourceSuccess extends UpdateSuccess {
  readonly updatedResource: Leaf;

  constructor(uri: string, resource: Leaf) {
    super(uri);
    this.updatedResource = resource;
  }
}
