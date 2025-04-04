import { ResourceSuccess } from "@ldo/connected";
import type { WacRule } from "../WacRule";
import type { SolidLeaf } from "../../resources/SolidLeaf";
import type { SolidContainer } from "../../resources/SolidContainer";

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

  constructor(resoure: ResourceType, wacRule: WacRule) {
    super(resoure);
    this.wacRule = wacRule;
  }
}
