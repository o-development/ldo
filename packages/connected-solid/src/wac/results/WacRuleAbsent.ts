import { ResourceSuccess } from "@ldo/connected";
import type { SolidLeaf } from "../../resources/SolidLeaf";
import type { SolidContainer } from "../../resources/SolidContainer";

/**
 * Returned if no WAC rule was returned from the server
 */
export class WacRuleAbsent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResourceType extends SolidLeaf<any[]> | SolidContainer<any[]>,
> extends ResourceSuccess<ResourceType> {
  type = "wacRuleAbsent" as const;
}
