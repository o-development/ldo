import type { Resource } from "@ldo/connected";
import { SolidResource } from "./SolidResource";
import type { SolidContainerUri, SolidLeafUri } from "../types";

export class SolidLeaf
  extends SolidResource
  implements Resource<SolidLeafUri> {
  public uri: SolidLeafUri;

  constructor() {
    super()
  }
    
}
