import { ShapeType } from "@ldo/ldo";
import { wacSchema } from "./wac.schema";
import { wacContext } from "./wac.context";
import { Authorization } from "./wac.typings";

/**
 * =============================================================================
 * LDO ShapeTypes wac
 * =============================================================================
 */

/**
 * Authorization ShapeType
 */
export const AuthorizationShapeType: ShapeType<Authorization> = {
  schema: wacSchema,
  shape: "http://www.w3.org/ns/auth/acls#Authorization",
  context: wacContext,
};
