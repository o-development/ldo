import type { ResourceType } from "../abstract/AbstractResource";
import type { LeafType } from "../abstract/leaf/Leaf";
import { ResourceError } from "./ResourceError";

export class MethodNotAllowedError<
  rType extends ResourceType,
> extends ResourceError {
  type: "MethodNotAllowed";
  methodName: string;
  currentResource: rType;
}

export class LeafMethodNotAllowedError extends MethodNotAllowedError<LeafType> {}
export class ContainerMethodNotAllowedError extends MethodNotAllowedError<LeafType> {}
