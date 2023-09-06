import type { BranchContainer } from "../../concrete/BranchContainer";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { RootContainer } from "../../concrete/RootContainer";
import { PotentialDataResource } from "./potentialDataResource";

export type DataResourceClass = RootContainer | BranchContainer | DataLeaf;
export class DataResource extends PotentialDataResource {}
