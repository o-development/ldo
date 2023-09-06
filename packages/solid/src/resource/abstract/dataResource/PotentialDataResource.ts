import type { AbsentContainer } from "../../concrete/AbsentContainer";
import type { AbsentLeaf } from "../../concrete/AbsentLeaf";
import type { BranchContainer } from "../../concrete/BranchContainer";
import type { RootContainer } from "../../concrete/RootContainer";
import type { UnfetchedContainer } from "../../concrete/UnfetchedContainer";
import type { UnfetchedLeaf } from "../../concrete/UnfetchedLeaf";
import type { SolidLdoError } from "../../error/SolidLdoError";
import type { ResourceClass } from "../Resource";
import { Resource } from "../Resource";
import type { DataResource } from "./DataResource";

export type PotentialDataResourceClass =
  | RootContainer
  | BranchContainer
  | DataResource
  | AbsentContainer
  | AbsentLeaf
  | UnfetchedContainer
  | UnfetchedLeaf;
export abstract class PotentialDataResource extends Resource<
  ResourceClass,
  SolidLdoError
> {

  abstract 
}
