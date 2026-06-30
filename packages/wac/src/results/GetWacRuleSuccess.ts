import { ResourceSuccess } from "@ldo/connected";
import type { SolidContainer, SolidLeaf } from "@ldo/connected-solid";
import type { WacRule } from "../WacRule";

/**
 * Returned when a WAC rule is successfully retrieved
 */
export class GetWacRuleSuccess<
  ResourceType extends SolidLeaf | SolidContainer,
> extends ResourceSuccess<ResourceType> {
  type = "getWacRuleSuccess" as const;
  /**
   * The rule that was retrieved
   */
  wacRule: WacRule;

  constructor(resource: ResourceType, wacRule: WacRule) {
    super(resource);
    this.wacRule = wacRule;
  }
}
