import { CreateSuccess } from "../../requester/results/success/CreateSuccess";
import type { Container } from "../Container";
import type { Leaf } from "../Leaf";

export class CreateResourceSuccess<
  ResourceType extends Leaf | Container,
> extends CreateSuccess {
  readonly createdResource: ResourceType;

  constructor(uri: string, didOverwrite: boolean, resource: ResourceType) {
    super(uri, didOverwrite);
    this.createdResource = resource;
  }
}
