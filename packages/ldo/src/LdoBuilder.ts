import type { GraphNode, QuadMatch, SubjectNode } from "@ldo/rdf-utils";
import type {
  LanguageOrdering,
  JsonldDatasetProxyBuilder,
} from "@ldo/jsonld-dataset-proxy";
import type { ShapeType } from "./ShapeType";
import type { LdoBase } from "./util";
import { normalizeNodeName, normalizeNodeNames } from "./util";

/**
 * A wrapper around Jsonld Dataset Proxy Builder with a slightly more friendly
 * user experience that doesn't require the use of rdfjs datatypes.
 */
export class LdoBuilder<Type extends LdoBase> {
  private jsonldDatasetProxyBuilder: JsonldDatasetProxyBuilder;
  private shapeType: ShapeType<Type>;

  constructor(
    jsonldDatasetProxyBuilder: JsonldDatasetProxyBuilder,
    shapeType: ShapeType<Type>,
  ) {
    this.jsonldDatasetProxyBuilder = jsonldDatasetProxyBuilder;
    this.shapeType = shapeType;
  }

  /**
   * Designates that all Linked Data Objects created should write to the
   * specified graphs
   */
  write(...graphs: (GraphNode | string)[]): LdoBuilder<Type> {
    return new LdoBuilder(
      this.jsonldDatasetProxyBuilder.write(...normalizeNodeNames(graphs)),
      this.shapeType,
    );
  }

  /**
   * Sets the order of language preferences for Language Strings. Acceptable
   * values as EITF language tags, "@none" and "@other"
   */
  setLanguagePreferences(
    ...languageOrdering: LanguageOrdering
  ): LdoBuilder<Type> {
    return new LdoBuilder(
      this.jsonldDatasetProxyBuilder.setLanguagePreferences(
        ...languageOrdering,
      ),
      this.shapeType,
    );
  }

  /**
   * Creates a Linked Data Object that matches the given subject
   * @param subject The node to match
   */
  fromSubject(subject: SubjectNode | string): Type {
    return this.jsonldDatasetProxyBuilder.fromSubject<Type>(
      normalizeNodeName(subject),
    );
  }

  /**
   * Matches Subjects to provided predicates, objects, and graphs. Returns a
   * JSON LD Dataset that can be read an modified.
   * @param predicate The predicate to match
   * @param object The object to match
   * @param graph The graph to match
   */
  matchSubject(
    predicate: QuadMatch[1] | string,
    object?: QuadMatch[2] | string,
    graph?: QuadMatch[3] | string,
  ): Type[] {
    return this.jsonldDatasetProxyBuilder.matchSubject<Type>(
      predicate != undefined ? normalizeNodeName(predicate) : undefined,
      object != undefined ? normalizeNodeName(object) : undefined,
      graph != undefined ? normalizeNodeName(graph) : undefined,
    );
  }

  /**
   * Matches Objects to provided subjects, predicates, and graphs. Returns a
   * collection of Linked Data Objects that can be read an modified.
   * @param subject The subject to match
   * @param predicate The predicate to match
   * @param graph The graph to match
   */
  matchObject(
    subject?: QuadMatch[0] | string,
    predicate?: QuadMatch[1] | string,
    graph?: QuadMatch[3] | string,
  ): Type[] {
    return this.jsonldDatasetProxyBuilder.matchObject<Type>(
      subject != undefined ? normalizeNodeName(subject) : undefined,
      predicate != undefined ? normalizeNodeName(predicate) : undefined,
      graph != undefined ? normalizeNodeName(graph) : undefined,
    );
  }

  /**
   * Takes a given object and places it in the dataset while returning a Linked
   * Data Object representing the object.
   *
   * @param inputData Initial Data
   * @param graph Optional graph to save this data to
   */
  fromJson(inputData: Type): Type {
    return this.jsonldDatasetProxyBuilder.fromJson<Type>(inputData);
  }
}
