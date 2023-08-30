import { createDataset, DatasetChanges } from "o-dataset-pack";
import { GraphType } from "jsonld-dataset-proxy";
import { Quad } from "@rdfjs/types";
import { defaultGraph, namedNode, quad as createQuad } from "@rdfjs/data-model";

export function graphNodeToString(graphNode: GraphType): string {
  return graphNode.termType === "DefaultGraph"
    ? "defaultGraph()"
    : graphNode.value;
}

export function stringToGraphNode(input: string): GraphType {
  return input === "defaultGraph()" ? defaultGraph() : namedNode(input);
}

export function splitChangesByGraph(
  changes: DatasetChanges<Quad>
): Map<GraphType, DatasetChanges<Quad>> {
  const changesMap: Record<string, DatasetChanges<Quad>> = {};
  changes.added?.forEach((quad) => {
    const graphHash = graphNodeToString(quad.graph as GraphType);
    if (!changesMap[graphHash]) {
      changesMap[graphHash] = {};
    }
    if (!changesMap[graphHash].added) {
      changesMap[graphHash].added = createDataset();
    }
    changesMap[graphHash].added?.add(
      createQuad(quad.subject, quad.predicate, quad.object, quad.graph)
    );
  });

  changes.removed?.forEach((quad) => {
    const graphHash = graphNodeToString(quad.graph as GraphType);
    if (!changesMap[graphHash]) {
      changesMap[graphHash] = {};
    }
    if (!changesMap[graphHash].removed) {
      changesMap[graphHash].removed = createDataset();
    }
    changesMap[graphHash].removed?.add(
      createQuad(quad.subject, quad.predicate, quad.object, quad.graph)
    );
  });

  const finalMap = new Map<GraphType, DatasetChanges<Quad>>();
  Object.entries(changesMap).forEach(([key, value]) => {
    finalMap.set(stringToGraphNode(key), value);
  });
  return finalMap;
}
