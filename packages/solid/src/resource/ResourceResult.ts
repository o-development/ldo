import type { LeafCreateAndOverwriteResult } from "../requester/requests/createDataResource";
import { createDataResource } from "../requester/requests/createDataResource";
import type { RequesterResult } from "../requester/results/RequesterResult";
import type { Container } from "./Container";
import type { Leaf } from "./Leaf";

export type ResourceResult<
  Result extends RequesterResult,
  ResourceType extends Leaf | Container,
> = Result & { resource: ResourceType };
