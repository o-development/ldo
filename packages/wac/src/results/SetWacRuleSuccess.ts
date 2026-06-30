import { ResourceSuccess } from "@ldo/connected";
import type { SolidContainer, SolidLeaf } from "@ldo/connected-solid";
import type { WacRule } from "../WacRule";

/**
 * Returned when rules were successfully written
 */
export class SetWacRuleSuccess<
  ResourceType extends SolidLeaf<[]> | SolidContainer<[]>,
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
