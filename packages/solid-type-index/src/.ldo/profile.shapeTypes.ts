import { ShapeType } from "@ldo/ldo";
import { profileSchema } from "./profile.schema";
import { profileContext } from "./profile.context";
import { TypeIndexProfile } from "./profile.typings";

/**
 * =============================================================================
 * LDO ShapeTypes profile
 * =============================================================================
 */

/**
 * TypeIndexProfile ShapeType
 */
export const TypeIndexProfileShapeType: ShapeType<TypeIndexProfile> = {
  schema: profileSchema,
  shape: "https://shaperepo.com/schemas/solidProfile#TypeIndexProfile",
  context: profileContext,
};
