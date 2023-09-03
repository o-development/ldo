import { blankNode, namedNode } from "@rdfjs/data-model";
import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { GraphNode, QuadMatch } from "@ldo/rdf-utils";
import type { LanguageOrdering } from "./language/languageTypes";
import type { ProxyContext } from "./ProxyContext";
import type { ObjectLike } from "./types";

/**
 * Helps build JSON LD Dataset Proxies for a specific dataset and context
 */
export class JsonldDatasetProxyBuilder {
  private proxyContext: ProxyContext;

  constructor(proxyContext: ProxyContext) {
    this.proxyContext = proxyContext;
  }

  /**
   * Designates that all Jsonld Dataset Proxies created should write to the
   * specified graphs
   */
  write(...graphs: GraphNode[]): JsonldDatasetProxyBuilder {
    return new JsonldDatasetProxyBuilder(
      this.proxyContext.duplicate({ writeGraphs: graphs }),
    );
  }

  /**
   * List the language tags in the order they should be used. When a langString
   * is accessed, LDO will search for values in the order of language given.
   * @param languageOrdering The ordering of languages. For example
   * ("en", "fr", "none", "other"). Defaults to
   * ("none", "en", "other")
   */
  setLanguagePreferences(
    ...languageOrdering: LanguageOrdering
  ): JsonldDatasetProxyBuilder {
    return new JsonldDatasetProxyBuilder(
      this.proxyContext.duplicate({ languageOrdering }),
    );
  }

  /**
   * Creates a JSON LD Dataset Proxy that matches the given subject
   * @param subject The node to match
   */
  fromSubject<T extends ObjectLike>(subject: NamedNode | BlankNode): T {
    return this.proxyContext.createSubjectProxy(subject) as unknown as T;
  }

  /**
   * Matches Subjects to provided predicates, objects, and graphs. Returns a
   * JSON LD Dataset that can be read an modified.
   * @param predicate The predicate to match
   * @param object The object to match
   * @param graph The graph to match
   */
  matchSubject<T extends ObjectLike>(
    predicate?: QuadMatch[1],
    object?: QuadMatch[2],
    graph?: QuadMatch[3],
  ): T[] {
    return this.proxyContext.createArrayProxy(
      [null, predicate, object, graph],
      true,
    ) as unknown as T[];
  }

  /**
   * Matches Objects to provided subjects, predicates, and graphs. Returns a
   * JSON LD Dataset that can be read an modified.
   * @param subject The subject to match
   * @param predicate The predicate to match
   * @param graph The graph to match
   */
  matchObject<T extends ObjectLike>(
    subject?: QuadMatch[0],
    predicate?: QuadMatch[1],
    graph?: QuadMatch[3],
  ): T[] {
    return this.proxyContext.createArrayProxy([
      subject,
      predicate,
      null,
      graph,
    ]) as unknown as T[];
  }

  /**
   * Takes a given object and places it in the dataset while returning a JSON LD
   * Dataset Proxy representing the object.
   *
   * @param inputData Initial Data
   * @param graph Optional graph to save this data to
   */
  fromJson<T extends ObjectLike>(inputData: T): T {
    const entryNode = inputData["@id"]
      ? namedNode(inputData["@id"])
      : blankNode();
    const proxy = this.fromSubject<T>(entryNode);
    Object.entries(inputData).forEach(([key, value]) => {
      proxy[<keyof T>key] = value;
    });
    return proxy;
  }
}
