import type { DataFactory, DatasetCore, Quad_Graph } from "@rdfjs/types";
import type { ITermWrapperConstructor, TermWrapper } from "@rdfjs/wrapper";
import type { GraphNode, QuadMatch, SubjectNode } from "@ldo/rdf-utils";
import { defaultGraph } from "@ldo/rdf-utils";
import { normalizeNodeName, normalizeNodeNames } from "./util.js";
import { GraphWriteDataset } from "./GraphWriteDataset.js";
import { MatchingSet } from "./MatchingSet.js";

/**
 * An LdoBuilder contains utility methods for building a Linked Data Object for a certain type.
 *
 * It is not recommended to instantiate an LdoBuilder directly. Instead use
 * {@link LdoDataset.usingType} or {@link createLdoDataset}.
 *
 * @typeParam Type - The TypeScript type of the eventual Linked Data Object.
 *
 * @example
 * ```typescript
 * import { LdoDataset, createLdoDatasetFactory } from "@ldo/ldo";
 * import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes";
 *
 * const ldoDataset = createLdoDataset();
 * const ldoBuilder = ldoDataset.usingType(FoafProfileShapeType);
 * const profile = ldoBuilder
 *   .write("https://example.com/someGraph")
 *   .fromSubject("https://example.com/profile#me");
 * ```
 */
export class LdoBuilder<Type extends TermWrapper> {
  /**
   * @internal
   */
  protected writeGraphs: GraphNode[];

  constructor(
    protected readonly termWrapperClass: ITermWrapperConstructor<Type>,
    protected readonly dataset: DatasetCore,
    protected readonly factory: DataFactory,
    config?: { writeGraphs: GraphNode[] },
  ) {
    this.writeGraphs = config?.writeGraphs ?? [defaultGraph()];
  }

  /**
   * Returns a GraphWriteDataset view that routes writes to the configured graphs
   * while reading and deleting across all graphs in the base dataset.
   */
  protected get view(): GraphWriteDataset {
    return new GraphWriteDataset(
      this.dataset,
      this.writeGraphs as Quad_Graph[],
      this.factory,
    );
  }

  /**
   * `fromSubject` creates a Linked Data Object entry point at the given subject node.
   * The returned wrapper reads from all graphs but writes only to the configured
   * write graphs (see {@link write}).
   *
   * @param subject - A named node, blank node, or string IRI.
   * @returns A Linked Data Object for the provided subject.
   *
   * @example
   * ```typescript
   * const profile = ldoDataset
   *   .usingType(FoafProfileShapeType)
   *   .fromSubject("http://example.com/Person1");
   * ```
   */
  fromSubject(subject: SubjectNode | string): Type {
    return new this.termWrapperClass(
      normalizeNodeName(subject),
      this.view,
      this.factory,
    );
  }

  /**
   * `matchSubject` returns a live `Set<Type>` whose elements are all distinct subjects
   * in the dataset matching the given predicate, object, and graph.
   *
   * The set is live: iteration and size always reflect the current dataset state.
   * Membership uses RDF term equality (not JS reference equality).
   * Wrappers yielded from the set read from all graphs and write to the configured
   * write graphs.
   *
   * @param predicate - A valid Predicate Node (NamedNode) or a string URI.
   * @param object - A valid object node (NamedNode, Blank Node, or Literal) or a string URI.
   * @param graph - A valid graph node (NamedNode or DefaultGraph) or a string URI.
   *
   * @returns A live Set of Linked Data Objects whose subjects match the provided pattern.
   *
   * @example
   * ```typescript
   * const profiles = ldoDataset
   *   .usingType(FoafProfileShapeType)
   *   .matchSubject(
   *     namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
   *     namedNode("http://xmlns.com/foaf/0.1/Person")
   *   );
   * profiles.forEach((person) => {
   *   console.log(person.fn);
   * });
   * ```
   */
  matchSubject(
    predicate: QuadMatch[1] | string,
    object?: QuadMatch[2] | string,
    graph?: QuadMatch[3] | string,
  ): Set<Type> {
    return new MatchingSet(
      "subject",
      {
        predicate:
          predicate != undefined ? normalizeNodeName(predicate) : undefined,
        object: object != undefined ? normalizeNodeName(object) : undefined,
        graph: graph != undefined ? normalizeNodeName(graph) : undefined,
      },
      this.termWrapperClass,
      this.view,
      this.factory,
    );
  }

  /**
   * `matchObject` returns a live `Set<Type>` whose elements are all distinct objects
   * in the dataset matching the given subject, predicate, and graph.
   *
   * The set is live: iteration and size always reflect the current dataset state.
   * Membership uses RDF term equality (not JS reference equality).
   * Wrappers yielded from the set read from all graphs and write to the configured
   * write graphs.
   *
   * @param subject - A valid object node (NamedNode or Blank Node) or a string URI.
   * @param predicate - A valid Predicate Node (NamedNode) or a string URI.
   * @param graph - A valid graph node (NamedNode or DefaultGraph) or a string URI.
   *
   * @returns A live Set of Linked Data Objects whose terms match the provided pattern.
   *
   * @example
   * ```typescript
   * const profiles = ldoDataset
   *   .usingType(FoafProfileShapeType)
   *   .matchObject(
   *     null,
   *     "http://xmlns.com/foaf/0.1/primaryTopic"
   *   );
   * ```
   */
  matchObject(
    subject?: QuadMatch[0] | string,
    predicate?: QuadMatch[1] | string,
    graph?: QuadMatch[3] | string,
  ): Set<Type> {
    return new MatchingSet(
      "object",
      {
        subject: subject != undefined ? normalizeNodeName(subject) : undefined,
        predicate:
          predicate != undefined ? normalizeNodeName(predicate) : undefined,
        graph: graph != undefined ? normalizeNodeName(graph) : undefined,
      },
      this.termWrapperClass,
      this.view,
      this.factory,
    );
  }

  /**
   * Designates that all Linked Data Objects created from this builder should write
   * new triples only to the specified graphs. Reads and deletes always span all graphs.
   *
   * NOTE: These operations only dictate the graph for new triples. Any operations
   * that delete triples will delete triples regardless of their graph.
   *
   * Returns a new LdoBuilder; the original builder's write graphs are unchanged.
   *
   * @param graphs - Graph Nodes or string URIs that all add operations will target.
   *
   * @returns A new LdoBuilder with the given write graphs.
   *
   * @example
   * ```typescript
   * const person1 = ldoDataset.usingType(FoafShapeType)
   *   .write(namedNode("http://example.com/ExampleGraph"))
   *   .fromSubject(namedNode("http://example.com/Person1"));
   * person1.name.push("Jack");
   * console.log(dataset.toString());
   * // Logs:
   * // <http://example.com/Person1> <http://xmlns.com/foaf/0.1/name> "Jack" <http://example.com/ExampleGraph> .
   * ```
   */
  write(...graphs: (GraphNode | string)[]): LdoBuilder<Type> {
    return new LdoBuilder(this.termWrapperClass, this.dataset, this.factory, {
      writeGraphs: [...normalizeNodeNames(graphs)],
    });
  }
}
