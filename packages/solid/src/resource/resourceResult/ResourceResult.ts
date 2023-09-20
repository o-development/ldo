import type { RequesterResult } from "../../requester/results/RequesterResult";
import type { Container } from "../Container";
import type { Leaf } from "../Leaf";

export type ResourceSuccess<
  Result extends RequesterResult,
  ResourceType extends Leaf | Container,
> = Result & { resource: ResourceType };

export type ResourceResult<
  Result extends RequesterResult,
  ResourceType extends Leaf | Container,
> = Result extends Error ? Result : ResourceSuccess<Result, ResourceType>;
