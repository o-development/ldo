import type { DataFactory, Quad } from "@rdfjs/types";
import {
  namedNode,
  blankNode,
  literal,
  defaultGraph,
  quad,
} from "@ldo/rdf-utils";

// Assemble a DataFactory from @ldo/rdf-utils (which re-exports @rdfjs/data-model
// with ESM/CJS interop already handled). variable() is optional in the interface.
export const dataFactory = {
  namedNode,
  blankNode,
  literal,
  defaultGraph,
  quad,
} as unknown as DataFactory<Quad, Quad>;
