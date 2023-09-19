import { DeleteSuccess } from "../../requester/results/success/DeleteSuccess";
import type { Container } from "../Container";
import type { Leaf } from "../Leaf";

export class DeleteResourceSuccess<
  ResourceType extends Leaf | Container,
> extends DeleteSuccess {
  readonly deletedResource: ResourceType;

  constructor(uri: string, resourceExisted: boolean, resource: ResourceType) {
    super(uri, resourceExisted);
    this.deletedResource = resource;
  }
}
