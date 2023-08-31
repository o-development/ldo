import { ShapeType } from "../../lib";
import { foafProfileSchema } from "./foafProfile.schema";
import { foafProfileContext } from "./foafProfile.context";
import { FoafProfile } from "./foafProfile.typings";

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
