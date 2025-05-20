import type { Quad, Term, BlankNode, DefaultGraph, Literal, NamedNode } from "@rdfjs/types";
export type NodeTermTypes<Node extends Term> = Set<Node["termType"]>;
export type SubjectNode = NamedNode | BlankNode;
export declare const SubjectTermTypes: NodeTermTypes<SubjectNode>;
export type PredicateNode = NamedNode;
export declare const PredicateTermTypes: NodeTermTypes<PredicateNode>;
export type ObjectNode = NamedNode | BlankNode | Literal;
export declare const ObjectTermTypes: NodeTermTypes<ObjectNode>;
export type GraphNode = NamedNode | BlankNode | DefaultGraph;
export declare const GraphTermTypes: NodeTermTypes<GraphNode>;
export type AnyNode = SubjectNode | PredicateNode | ObjectNode | GraphNode;
export declare const AnyTermTypes: NodeTermTypes<AnyNode>;
export interface SimpleQuad extends Quad {
    subject: SubjectNode;
    predicate: PredicateNode;
    object: ObjectNode;
    graph: GraphNode;
}
export type QuadMatch = [
    SubjectNode | undefined | null,
    PredicateNode | undefined | null,
    ObjectNode | undefined | null,
    GraphNode | undefined | null
];
export declare function subjectNodeToString(node: SubjectNode): string;
export declare function predicateNodeToString(node: PredicateNode): string;
export declare function objectNodeToString(node: ObjectNode): string;
export declare function grpahNodeToString(node: GraphNode): string;
export declare function nodeToString(node: AnyNode): string;
export declare function quadToString(quad: Quad): string;
export declare function quadMatchToString(quadMatch: QuadMatch): string;
export declare function stringToSubjectNode(input: string): SubjectNode;
export declare function stringToPredicateNode(input: string): PredicateNode;
export declare function stringToObjectNode(input: string): ObjectNode;
export declare function stringToGraphNode(input: string): GraphNode;
export declare function stringToNode(input: string, expectTermType?: NodeTermTypes<Term>): AnyNode;
export declare function stringToQuad(input: string): import("rdf-js").Quad;
export declare function stringToQuadMatch(input: string): QuadMatch;
//# sourceMappingURL=nodeSerialization.d.ts.map