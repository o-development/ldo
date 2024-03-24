import type { GraphNode, QuadMatch, SubjectNode } from "@ldo/rdf-utils";
import type { BlankNode, Dataset, NamedNode } from "@rdfjs/types";
import type { ArrayProxyTarget } from "./arrayProxy/createArrayHandler";
import { createArrayHandler } from "./arrayProxy/createArrayHandler";
import { createSubjectHandler } from "./subjectProxy/createSubjectHandler";
import type { SubjectProxy } from "./subjectProxy/SubjectProxy";
import type { ArrayProxy } from "./arrayProxy/ArrayProxy";
import { _getUnderlyingArrayTarget } from "./types";
import type { ContextUtil } from "./ContextUtil";
import type { LanguageOrdering } from "./language/languageTypes";
import { namedNode } from "@rdfjs/data-model";

export interface ProxyContextOptions {
  dataset: Dataset;
  contextUtil: ContextUtil;
  writeGraphs: GraphNode[];
  languageOrdering: LanguageOrdering;
  prefilledArrayTargets?: ArrayProxyTarget[];
  state?: Record<string, unknown>;
}

const rdfType = namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");

/**
 * This file keeps track of the target objects used in the proxies.
 * The reason is so that JSON.stringify does not recurse inifinitely
 * when it encounters a circular object.
 */
export class ProxyContext {
  private subjectMap: Map<string, SubjectProxy> = new Map();
  private arrayMap: Map<string, ArrayProxy> = new Map();

  readonly dataset: Dataset;
  readonly contextUtil: ContextUtil;
  readonly writeGraphs: GraphNode[];
  readonly languageOrdering: LanguageOrdering;
  public state: Record<string, unknown>;

  constructor(options: ProxyContextOptions) {
    this.dataset = options.dataset;
    this.contextUtil = options.contextUtil;
    this.writeGraphs = options.writeGraphs;
    this.languageOrdering = options.languageOrdering;
    this.state = options.state || {};
    if (options.prefilledArrayTargets) {
      options.prefilledArrayTargets.forEach((target) => {
        this.createArrayProxy(target[0], target[2], target);
      });
    }
  }

  public createSubjectProxy(node: NamedNode | BlankNode): SubjectProxy {
    if (!this.subjectMap.has(node.value)) {
      const proxy = new Proxy(
        { "@id": node },
        this.createSubjectHandler(),
      ) as unknown as SubjectProxy;
      this.subjectMap.set(node.value, proxy);
    }
    return this.subjectMap.get(node.value) as SubjectProxy;
  }

  protected createSubjectHandler() {
    return createSubjectHandler(this);
  }

  private getArrayKey(...quadMatch: QuadMatch) {
    return `${quadMatch[0]?.value || "undefined"}|${
      quadMatch[1]?.value || "undefined"
    }|${quadMatch[2]?.value || "undefined"}|${
      quadMatch[3]?.value || "undefined"
    }`;
  }

  public createArrayProxy(
    quadMatch: QuadMatch,
    isSubjectOriented = false,
    initialTarget?: ArrayProxyTarget,
    isLangStringArray?: boolean,
  ): ArrayProxy {
    const key = this.getArrayKey(...quadMatch);
    if (!this.arrayMap.has(key)) {
      const proxy = new Proxy(
        initialTarget || [quadMatch, [], isSubjectOriented, isLangStringArray],
        this.createArrayHandler(),
      ) as unknown as ArrayProxy;
      this.arrayMap.set(key, proxy);
    }
    return this.arrayMap.get(key) as ArrayProxy;
  }

  protected createArrayHandler() {
    return createArrayHandler(this);
  }

  public duplicate(alternativeOptions: Partial<ProxyContextOptions>) {
    const prefilledArrayTargets: ArrayProxyTarget[] = [];
    this.arrayMap.forEach((value) => {
      prefilledArrayTargets.push(value[_getUnderlyingArrayTarget]);
    });
    const fullOptions: ProxyContextOptions = {
      ...{
        dataset: this.dataset,
        contextUtil: this.contextUtil,
        writeGraphs: this.writeGraphs,
        languageOrdering: this.languageOrdering,
        prefilledArrayTargets,
      },
      ...alternativeOptions,
    };
    return new ProxyContext(fullOptions);
  }

  public getRdfType(subjectNode: SubjectNode): NamedNode[] {
    return this.dataset
      .match(subjectNode, rdfType)
      .toArray()
      .map((quad) => quad.object)
      .filter((object): object is NamedNode => object.termType === "NamedNode");
  }
}
