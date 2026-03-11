import type { ShapeType } from "@ldo/ldo";
import { postSchema } from "./post.schema";
import { postContext } from "./post.context";
import type { PostSh } from "./post.typings";

/**
 * =============================================================================
 * LDO ShapeTypes post
 * =============================================================================
 */

/**
 * PostSh ShapeType
 */
export const PostShShapeType: ShapeType<PostSh> = {
  schema: postSchema,
  shape: "https://example.com/PostSh",
  context: postContext,
};
