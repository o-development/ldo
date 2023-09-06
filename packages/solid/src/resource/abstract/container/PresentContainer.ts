import { Mixin } from "ts-mixer";
import type { BranchContainer } from "../../concrete/BranchContainer";
import type { RootContainer } from "../../concrete/RootContainer";
import { DataResource } from "../dataResource/DataResource";
import { Container } from "./Container";
import { Present } from "../fetchStatus/Present";

export type PresentContainerClass = RootContainer | BranchContainer;
export class PresentContainer extends Mixin(Container, Present, DataResource) {}
