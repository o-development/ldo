import { ResourceSuccess } from "@ldo/connected";
import type {
  SolidContainer,
  SolidLeaf,
  SolidLeafUri,
} from "@ldo/connected-solid";

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
