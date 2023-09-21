import type {
  ArrayProxyTarget,
  SubjectProxyTarget,
  ProxyContextOptions,
} from "@ldo/jsonld-dataset-proxy";
import { ProxyContext } from "@ldo/jsonld-dataset-proxy";
import type { QuadMatch } from "@ldo/rdf-utils";
import type { SubscribableDataset } from "@ldo/subscribable-dataset";
import { namedNode } from "@rdfjs/data-model";
import type { Quad } from "@rdfjs/types";

export interface TrackingProxyContextOptions extends ProxyContextOptions {
  dataset: SubscribableDataset<Quad>;
}

export class TrackingProxyContext extends ProxyContext {
  private listener: () => void;
  private subscribableDataset: SubscribableDataset<Quad>;

  constructor(options: TrackingProxyContextOptions, listener: () => void) {
    super(options);
    this.subscribableDataset = options.dataset;
    this.listener = listener;
  }

  // Adds the listener to the subscribable dataset while ensuring deduping of the listener
  private addListener(eventName: QuadMatch) {
    const listeners = this.subscribableDataset.listeners(eventName);
    if (!listeners.includes(this.listener)) {
      this.subscribableDataset.on(eventName, this.listener);
    }
  }

  protected createSubjectHandler(): ProxyHandler<SubjectProxyTarget> {
    const baseHandler = super.createSubjectHandler();
    const oldGetFunction = baseHandler.get;
    const newGetFunction: ProxyHandler<SubjectProxyTarget>["get"] = (
      target: SubjectProxyTarget,
      key: string | symbol,
      receiver,
    ) => {
      const subject = target["@id"];
      if (typeof key === "symbol") {
        // Do Nothing
      } else if (key === "@id") {
        this.addListener([subject, null, null, null]);
      } else if (!this.contextUtil.isArray(key)) {
        const predicate = namedNode(this.contextUtil.keyToIri(key));
        this.addListener([subject, predicate, null, null]);
      }
      return oldGetFunction && oldGetFunction(target, key, receiver);
    };
    baseHandler.get = newGetFunction;
    baseHandler.set = () => {
      console.warn(
        "You've attempted to set a value on a Linked Data Object from the useSubject, useMatchingSubject, or useMatchingObject hooks. These linked data objects should only be used to render data, not modify it. To modify data, use the `changeData` function.",
      );
      return true;
    };
    return baseHandler;
  }

  protected createArrayHandler(): ProxyHandler<ArrayProxyTarget> {
    const baseHandler = super.createArrayHandler();
    const oldGetFunction = baseHandler.get;
    const newGetFunction: ProxyHandler<ArrayProxyTarget>["get"] = (
      target: ArrayProxyTarget,
      key: string | symbol,
      receiver,
    ) => {
      if (qualifiedArrayMethods.has(key)) {
        this.addListener([target[0][0], target[0][1], target[0][2], null]);
      }
      return oldGetFunction && oldGetFunction(target, key, receiver);
    };
    baseHandler.get = newGetFunction;
    return baseHandler;
  }
}

const qualifiedArrayMethods = new Set([
  "forEach",
  "map",
  "reduce",
  Symbol.iterator,
  "entries",
  "every",
  "filter",
  "find",
  "findIndex",
  "findLast",
  "findLastIndex",
  "includes, indexOf",
  "keys",
  "lastIndexOf",
  "reduceRight",
  "some",
  "values",
]);
