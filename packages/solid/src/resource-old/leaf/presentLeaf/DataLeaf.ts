import type { LdoDataset } from "@ldo/ldo";
import type { DataResource, LdoSolidError, PotentialData } from "../../types";
import { PresentLeaf } from "./PresentLeaf";

export class DataLeaf
  extends PresentLeaf
  implements DataResource, PotentialData
{
  get isBinary(): false {
    return false;
  }
  get isDataResource(): true {
    return true;
  }

  get ldoDataset(): LdoDataset {
    throw new Error("Not Implemented");
  }

  createIfAbsent(): Promise<DataLeaf | LdoSolidError> {
    throw new Error("Method not implemented.");
  }
  createOrOverwrite(): Promise<DataLeaf | LdoSolidError> {
    throw new Error("Method not implemented.");
  }
}
