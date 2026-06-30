import { ResourceSuccess } from "@ldo/connected";
import type { SolidContainer, SolidLeaf } from "@ldo/connected-solid";

/**
 * Returned if no WAC rule was returned from the server
 */
export class WacRuleAbsent<
  ResourceType extends SolidLeaf | SolidContainer,
> extends ResourceSuccess<ResourceType> {
  type = "wacRuleAbsent" as const;
}
