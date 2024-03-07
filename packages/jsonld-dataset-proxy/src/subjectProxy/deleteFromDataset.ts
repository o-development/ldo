import { namedNode, quad } from "@rdfjs/data-model";
import type { Term } from "@rdfjs/types";
import type { SubjectProxyTarget } from "./createSubjectHandler";
import type { ProxyContext } from "../ProxyContext";

export function deleteValueFromDataset(
  target: SubjectProxyTarget,
  key: string | symbol,
  proxyContext: ProxyContext,
) {
  const nodesToRemove: Term[] = [];
  if (key === "@context") {
    return true;
  }
  if (key === "toString" || key === Symbol.toStringTag) {
    return true;
  }
  if (typeof key === "symbol") {
    return true;
  }
  const subject = target["@id"];
  const predicate = namedNode(
    proxyContext.contextUtil.keyToIri(key, proxyContext.getRdfType(subject)),
  );
  if (key === "@id") {
    nodesToRemove.push(target["@id"]);
  } else {
    const objectDataset = proxyContext.dataset.match(subject, predicate);
    if (objectDataset.size === 0) {
      return true;
    } else {
      nodesToRemove.push(...objectDataset.toArray().map((quad) => quad.object));
    }
  }
  nodesToRemove.forEach((term) => {
    if (term.termType === "Literal") {
      proxyContext.dataset.delete(quad(subject, predicate, term));
      return true;
    } else if (term.termType === "NamedNode") {
      proxyContext.dataset.deleteMatches(term, undefined, undefined);
      proxyContext.dataset.deleteMatches(undefined, undefined, term);
      return true;
    }
  });
  return true;
}
