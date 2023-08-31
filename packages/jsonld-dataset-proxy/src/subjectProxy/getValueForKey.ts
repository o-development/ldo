import type { SubjectProxyTarget } from "./createSubjectHandler";
import { namedNode } from "@rdfjs/data-model";
import { nodeToJsonldRepresentation } from "../util/nodeToJsonldRepresentation";
import type { SubjectProxy } from "./SubjectProxy";
import type { ArrayProxy } from "../arrayProxy/ArrayProxy";
import type { ProxyContext } from "../ProxyContext";
import { filterQuadsByLanguageOrdering } from "../language/languageUtils";

/**
 * Given a subject target and a key return the correct value
 */
export function getValueForKey(
  target: SubjectProxyTarget,
  key: string | symbol,
  proxyContext: ProxyContext,
): SubjectProxy | ArrayProxy | string | number | boolean | undefined {
  const { contextUtil, dataset } = proxyContext;
  if (key === "@id") {
    if (target["@id"].termType === "BlankNode") {
      return undefined;
    }
    return contextUtil.iriToKey(target["@id"].value);
  }
  if (key === "toString" || key === Symbol.toStringTag) {
    // TODO: this toString method right now returns [object Object],
    // which is correct, but it could be more descriptive, especially
    // because console.log doesn't return anyting helpful due to the proxy.
    return Reflect.get(target, "toString");
  }
  if (typeof key === "symbol") {
    return;
  }
  const subject = target["@id"];
  const predicate = namedNode(contextUtil.keyToIri(key));
  if (contextUtil.isArray(key)) {
    const arrayProxy = proxyContext.createArrayProxy(
      [subject, predicate, null, null],
      false,
      undefined,
      contextUtil.isLangString(key),
    );
    return arrayProxy;
  }
  let objectDataset = dataset.match(subject, predicate);
  if (contextUtil.isLangString(key)) {
    objectDataset = filterQuadsByLanguageOrdering(
      objectDataset,
      proxyContext.languageOrdering,
    );
  }
  if (objectDataset.size === 0) {
    return undefined;
  } else if (objectDataset.size === 1) {
    const thing = nodeToJsonldRepresentation(
      objectDataset.toArray()[0].object,
      proxyContext,
    );
    return thing;
  } else {
    return proxyContext.createArrayProxy([subject, predicate, null, null]);
  }
}
