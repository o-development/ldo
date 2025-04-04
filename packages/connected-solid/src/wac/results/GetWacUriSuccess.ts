import { ResourceSuccess } from "@ldo/connected";
import type { SolidLeafUri } from "../../types";
import type { SolidContainer } from "../../resources/SolidContainer";
import type { SolidLeaf } from "../../resources/SolidLeaf";

/**
 * Returned when the URI for a resources ACL document was successfully retried
 */
export class GetWacUriSuccess<
  ResourceType extends SolidContainer | SolidLeaf,
> extends ResourceSuccess<ResourceType> {
  type = "getWacUriSuccess" as const;
  /**
   * The URI of the ACL document
   */
  wacUri: SolidLeafUri;

  constructor(resource: ResourceType, wacUri: SolidLeafUri) {
    super(resource);
    this.wacUri = wacUri;
  }
}
