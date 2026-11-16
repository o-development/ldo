import type { ShapeType } from "@ldo/ldo";
import { foafProfileSchema } from "./foafProfile.schema";
import { foafProfileContext } from "./foafProfile.context";
import type { FoafProfile } from "./foafProfile.typings";

/**
 * =============================================================================
 * LDO ShapeTypes foafProfile
 * =============================================================================
 */

/**
 * FoafProfile ShapeType
 */
export const FoafProfileShapeType: ShapeType<FoafProfile> = {
  schema: foafProfileSchema,
  shape: "https://example.com/FoafProfile",
  context: foafProfileContext,
};
