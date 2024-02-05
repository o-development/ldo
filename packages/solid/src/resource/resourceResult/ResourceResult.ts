import type { RequesterResult } from "../../requester/results/RequesterResult";
import type { Container } from "../Container";
import type { Leaf } from "../Leaf";

/**
 * Adds an additional field "resource" to SuccessResults.
 */
export type ResourceSuccess<
  Result extends RequesterResult,
  ResourceType extends Leaf | Container,
> = Result & { resource: ResourceType };

/**
 * Adds an additional field "resource" to Results.
 */
export type ResourceResult<
  Result extends RequesterResult,
  ResourceType extends Leaf | Container,
> = Result extends Error ? Result : ResourceSuccess<Result, ResourceType>;
