import type { ReadResultError } from "../../requester/requests/readResource";
import {
  AbsentReadSuccess,
  BinaryReadSuccess,
  ContainerReadSuccess,
  DataReadSuccess,
} from "../../requester/results/success/ReadSuccess";
import type { Container } from "../Container";
import type { Leaf } from "../Leaf";

export type ReadResourceSuccessContainerTypes =
  | ContainerResourceReadSuccess
  | AbsentResourceReadSuccess<Container>
  | ReadResultError;
export type ReadResourceSuccessLeafTypes =
  | DataResourceReadSuccess
  | BinaryResourceReadSuccess
  | AbsentResourceReadSuccess<Leaf>
  | ReadResultError;

export class DataResourceReadSuccess extends DataReadSuccess {
  readonly readResource: Leaf;

  constructor(uri: string, recalledFromMemory: boolean, resource: Leaf) {
    super(uri, recalledFromMemory);
    this.readResource = resource;
  }
}

export class BinaryResourceReadSuccess extends BinaryReadSuccess {
  readonly readResource: Leaf;

  constructor(
    uri: string,
    recalledFromMemory: boolean,
    blob: Blob,
    mimeType: string,
    resource: Leaf,
  ) {
    super(uri, recalledFromMemory, blob, mimeType);
    this.readResource = resource;
  }
}

export class ContainerResourceReadSuccess extends ContainerReadSuccess {
  readonly readResource: Container;

  constructor(
    uri: string,
    recalledFromMemory: boolean,
    isRootContainer: boolean,
    resource: Container,
  ) {
    super(uri, recalledFromMemory, isRootContainer);
    this.readResource = resource;
  }
}

export class AbsentResourceReadSuccess<
  ResourceType extends Leaf | Container,
> extends AbsentReadSuccess {
  readonly readResource: ResourceType;

  constructor(
    uri: string,
    recalledFromMemory: boolean,
    resource: ResourceType,
  ) {
    super(uri, recalledFromMemory);
    this.readResource = resource;
  }
}
