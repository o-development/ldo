import { ResourceSuccess } from "@ldo/connected";
import type { WacRule } from "../WacRule";
import type { SolidContainer } from "../../resources/SolidContainer";
import type { SolidLeaf } from "../../resources/SolidLeaf";

/**
 * Returned when rules were successfully written
 */
export class SetWacRuleSuccess<
  ResourceType extends SolidLeaf | SolidContainer,
> extends ResourceSuccess<ResourceType> {
  type = "setWacRuleSuccess" as const;
  /**
   * The written rule
   */
  wacRule: WacRule;

  constructor(resource: ResourceType, wacRule: WacRule) {
    super(resource);
    this.wacRule = wacRule;
  }
}
