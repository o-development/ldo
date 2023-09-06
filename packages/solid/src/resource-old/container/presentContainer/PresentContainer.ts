import type { LdoDataset } from "@ldo/ldo";
import type { DataResource, FetchedContainer, Present } from "../../types";
import { Container } from "../Container";
import type { BranchContainer } from "./BranchContainer";
import type { RootContainer } from "./RootContainer";

export type PresentContainerClass = BranchContainer | RootContainer;
export abstract class PresentContainer
  extends Container
  implements Present, DataResource, FetchedContainer
{
  get isPresent(): true {
    return true;
  }
  get isAbsent(): false {
    return false;
  }
  get isUnfetched(): false {
    return false;
  }
  get isDataResource(): true {
    return true;
  }
  get isBinary(): false {
    return false;
  }

  get ldoDataset(): LdoDataset {
    throw new Error("Not Implemented");
  }
}
