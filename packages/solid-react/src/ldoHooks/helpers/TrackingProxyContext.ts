import {
  ArrayProxyTarget,
  ProxyContext,
  SubjectProxyTarget,
  ProxyContextOptions,
} from "jsonld-dataset-proxy";
import { UpdateManager } from "./UpdateManager";
import { namedNode } from "@rdfjs/data-model";

export class TrackingProxyContext extends ProxyContext {
  private updateManager: UpdateManager;
  private listener: () => void;

  constructor(
    options: ProxyContextOptions,
    updateManager: UpdateManager,
    listener: () => void
  ) {
    super(options);
    this.updateManager = updateManager;
    this.listener = listener;
  }

  protected createSubjectHandler(): ProxyHandler<SubjectProxyTarget> {
    const baseHandler = super.createSubjectHandler();
    const oldGetFunction = baseHandler.get;
    const newGetFunction: ProxyHandler<SubjectProxyTarget>["get"] = (
      target: SubjectProxyTarget,
      key: string | symbol,
      receiver
    ) => {
      const subject = target["@id"];
      if (typeof key === "symbol") {
        // Do Nothing
      } else if (key === "@id") {
        this.updateManager.registerListener(
          [subject, null, null],
          this.listener
        );
      } else if (!this.contextUtil.isArray(key)) {
        const predicate = namedNode(this.contextUtil.keyToIri(key));
        this.updateManager.registerListener(
          [subject, predicate, null],
          this.listener
        );
      }
      return oldGetFunction && oldGetFunction(target, key, receiver);
    };
    baseHandler.get = newGetFunction;
    baseHandler.set = () => {
      console.warn(
        "You've attempted to set a value on a Linked Data Object from the useSubject, useMatchingSubject, or useMatchingObject hooks. These linked data objects should only be used to render data, not modify it. To modify data, use the `changeData` function."
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
      receiver
    ) => {
      if (qualifiedArrayMethods.has(key)) {
        this.updateManager.registerListener(
          [target[0][0], target[0][1], target[0][2]],
          this.listener
        );
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
