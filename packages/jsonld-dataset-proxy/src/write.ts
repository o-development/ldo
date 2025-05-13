import type { GraphNode } from "@ldo/rdf-utils";
import type { InteractOptions } from "./util/createInteractOptions.js";
import { createInteractOptions } from "./util/createInteractOptions.js";

/**
 * Set the graphs that should be written to
 * @param graphs The graphs that should be written to
 * @returns a write builder
 */
export function write(...graphs: GraphNode[]): InteractOptions {
  return createInteractOptions("writeGraphs", graphs);
}
