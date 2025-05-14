"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyTermTypes = exports.GraphTermTypes = exports.ObjectTermTypes = exports.PredicateTermTypes = exports.SubjectTermTypes = void 0;
exports.subjectNodeToString = subjectNodeToString;
exports.predicateNodeToString = predicateNodeToString;
exports.objectNodeToString = objectNodeToString;
exports.grpahNodeToString = grpahNodeToString;
exports.nodeToString = nodeToString;
exports.quadToString = quadToString;
exports.quadMatchToString = quadMatchToString;
exports.stringToSubjectNode = stringToSubjectNode;
exports.stringToPredicateNode = stringToPredicateNode;
exports.stringToObjectNode = stringToObjectNode;
exports.stringToGraphNode = stringToGraphNode;
exports.stringToNode = stringToNode;
exports.stringToQuad = stringToQuad;
exports.stringToQuadMatch = stringToQuadMatch;
const rdf_string_1 = require("rdf-string");
exports.SubjectTermTypes = new Set([
    "NamedNode",
    "BlankNode",
]);
exports.PredicateTermTypes = new Set([
    "NamedNode",
]);
exports.ObjectTermTypes = new Set([
    "NamedNode",
    "BlankNode",
    "Literal",
]);
exports.GraphTermTypes = new Set([
    "NamedNode",
    "BlankNode",
    "DefaultGraph",
]);
exports.AnyTermTypes = new Set([
    "NamedNode",
    "BlankNode",
    "DefaultGraph",
    "Literal",
]);
function subjectNodeToString(node) {
    return nodeToString(node);
}
function predicateNodeToString(node) {
    return nodeToString(node);
}
function objectNodeToString(node) {
    return nodeToString(node);
}
function grpahNodeToString(node) {
    return nodeToString(node);
}
function nodeToString(node) {
    return (0, rdf_string_1.termToString)(node);
}
function quadToString(quad) {
    return JSON.stringify((0, rdf_string_1.quadToStringQuad)(quad));
}
function quadMatchToString(quadMatch) {
    return JSON.stringify({
        subject: quadMatch[0] ? subjectNodeToString(quadMatch[0]) : undefined,
        predicate: quadMatch[1] ? predicateNodeToString(quadMatch[1]) : undefined,
        object: quadMatch[2] ? objectNodeToString(quadMatch[2]) : undefined,
        graph: quadMatch[3] ? grpahNodeToString(quadMatch[3]) : undefined,
    });
}
function stringToSubjectNode(input) {
    return stringToNode(input, exports.SubjectTermTypes);
}
function stringToPredicateNode(input) {
    return stringToNode(input, exports.PredicateTermTypes);
}
function stringToObjectNode(input) {
    return stringToNode(input, exports.ObjectTermTypes);
}
function stringToGraphNode(input) {
    return stringToNode(input, exports.GraphTermTypes);
}
function stringToNode(input, expectTermType) {
    const node = (0, rdf_string_1.stringToTerm)(input);
    if (expectTermType && !expectTermType.has(node.termType)) {
        throw new Error(`Expected term to be one of term type: [${Array.from(expectTermType).reduce((agg, termType) => `${agg}${termType}, `, "")}], but got ${node.termType}.`);
    }
    return node;
}
function stringToQuad(input) {
    try {
        return (0, rdf_string_1.stringQuadToQuad)(JSON.parse(input));
    }
    catch (err) {
        throw new Error("Invalid Quad String");
    }
}
function stringToQuadMatch(input) {
    try {
        const jsonRep = JSON.parse(input);
        return [
            jsonRep.subject != undefined
                ? stringToSubjectNode(jsonRep.subject)
                : undefined,
            jsonRep.predicate != undefined
                ? stringToPredicateNode(jsonRep.predicate)
                : undefined,
            jsonRep.object != undefined
                ? stringToObjectNode(jsonRep.object)
                : undefined,
            jsonRep.graph != undefined ? stringToGraphNode(jsonRep.graph) : undefined,
        ];
    }
    catch (err) {
        throw new Error("Invalid Quad Match String");
    }
}
//# sourceMappingURL=nodeSerialization.js.map