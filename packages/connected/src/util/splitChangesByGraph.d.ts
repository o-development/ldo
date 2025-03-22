import type { GraphNode, DatasetChanges } from "@ldo/rdf-utils";
import type { Quad } from "@rdfjs/types";
export declare function graphNodeToString(graphNode: GraphNode): string;
export declare function stringToGraphNode(input: string): GraphNode;
export declare function splitChangesByGraph(changes: DatasetChanges<Quad>): Map<GraphNode, DatasetChanges<Quad>>;
