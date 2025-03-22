"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitChangesByGraph = exports.stringToGraphNode = exports.graphNodeToString = void 0;
const dataset_1 = require("@ldo/dataset");
const data_model_1 = require("@rdfjs/data-model");
function graphNodeToString(graphNode) {
    return graphNode.termType === "DefaultGraph"
        ? "defaultGraph()"
        : graphNode.value;
}
exports.graphNodeToString = graphNodeToString;
function stringToGraphNode(input) {
    return input === "defaultGraph()" ? (0, data_model_1.defaultGraph)() : (0, data_model_1.namedNode)(input);
}
exports.stringToGraphNode = stringToGraphNode;
function splitChangesByGraph(changes) {
    const changesMap = {};
    changes.added?.forEach((quad) => {
        const graphHash = graphNodeToString(quad.graph);
        if (!changesMap[graphHash]) {
            changesMap[graphHash] = {};
        }
        if (!changesMap[graphHash].added) {
            changesMap[graphHash].added = (0, dataset_1.createDataset)();
        }
        changesMap[graphHash].added?.add((0, data_model_1.quad)(quad.subject, quad.predicate, quad.object, quad.graph));
    });
    changes.removed?.forEach((quad) => {
        const graphHash = graphNodeToString(quad.graph);
        if (!changesMap[graphHash]) {
            changesMap[graphHash] = {};
        }
        if (!changesMap[graphHash].removed) {
            changesMap[graphHash].removed = (0, dataset_1.createDataset)();
        }
        changesMap[graphHash].removed?.add((0, data_model_1.quad)(quad.subject, quad.predicate, quad.object, quad.graph));
    });
    const finalMap = new Map();
    Object.entries(changesMap).forEach(([key, value]) => {
        finalMap.set(stringToGraphNode(key), value);
    });
    return finalMap;
}
exports.splitChangesByGraph = splitChangesByGraph;
//# sourceMappingURL=splitChangesByGraph.js.map