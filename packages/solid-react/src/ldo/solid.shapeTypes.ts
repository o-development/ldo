import { ShapeType } from "ldo";
import { solidSchema } from "./solid.schema";
import { solidContext } from "./solid.context";
import { Container, Resource } from "./solid.typings";

/**
 * =============================================================================
 * LDO ShapeTypes solid
 * =============================================================================
 */

/**
 * Container ShapeType
 */
export const ContainerShapeType: ShapeType<Container> = {
  schema: solidSchema,
  shape: "http://www.w3.org/ns/lddps#Container",
  context: solidContext,
};

/**
 * Resource ShapeType
 */
export const ResourceShapeType: ShapeType<Resource> = {
  schema: solidSchema,
  shape: "http://www.w3.org/ns/lddps#Resource",
  context: solidContext,
};
