import type { BlankNode, NamedNode } from "@rdfjs/types";
import { literal, namedNode, quad } from "@rdfjs/data-model";
import { _getUnderlyingNode } from "../types";
import type { SubjectProxy } from "../subjectProxy/SubjectProxy";
import { getNodeFromRawObject, getNodeFromRawValue } from "./getNodeFromRaw";
import type { RawObject, RawValue } from "./RawObject";
import type { ProxyContext } from "../ProxyContext";
import { isSubjectProxy } from "../subjectProxy/isSubjectProxy";
import { NodeSet } from "./NodeSet";
import {
  getLanguageKeyForWriteOperation,
  languageDeleteMatch,
  languageKeyToLiteralLanguage,
} from "../language/languageUtils";

export function addRawValueToDatasetRecursive(
  subject: NamedNode | BlankNode,
  key: string,
  value: RawValue,
  visitedObjects: NodeSet,
  shouldDeleteOldTriples: boolean,
  proxyContext: ProxyContext,
): void {
  const { dataset, contextUtil } = proxyContext;
  const rdfType = proxyContext.getRdfType(subject);
  const predicate = namedNode(contextUtil.keyToIri(key, rdfType));
  // Get the Object Node
  const object = getNodeFromRawValue(key, value, rdfType, proxyContext);
  if (object == undefined) {
    dataset.deleteMatches(subject, predicate);
  } else if (object.termType === "Literal") {
    let languageAppliedObject = object;
    // Handle language use case
    if (contextUtil.isLangString(key, rdfType)) {
      const languageKey = getLanguageKeyForWriteOperation(
        proxyContext.languageOrdering,
      );
      if (!languageKey) return;
      languageAppliedObject = literal(
        object.value,
        languageKeyToLiteralLanguage(languageKey),
      );
    }
    proxyContext.writeGraphs.forEach((graph) => {
      proxyContext.dataset.add(
        quad(subject, predicate, languageAppliedObject, graph),
      );
    });
  } else {
    // Delete any triples if the id is the same
    // if (!visitedObjects.has(object) && !isSubjectProxy(value)) {
    //   console.log("deleting 2", object.value);
    //   dataset.deleteMatches(object, undefined, undefined);
    // }
    proxyContext.writeGraphs.forEach((graph) => {
      dataset.add(quad(subject, predicate, object, graph));
    });
    if (!isSubjectProxy(value)) {
      const updateData: RawObject = (
        typeof value === "object"
          ? { ...value, "@id": object }
          : { "@id": object }
      ) as RawObject;
      addRawObjectToDatasetRecursive(
        updateData,
        visitedObjects,
        shouldDeleteOldTriples,
        proxyContext,
      );
    }
  }
}

export function addRawObjectToDatasetRecursive(
  item: RawObject,
  visitedObjects: NodeSet,
  shouldDeleteOldTriples: boolean,
  proxyContext: ProxyContext,
): SubjectProxy {
  if (isSubjectProxy(item)) {
    return item as SubjectProxy;
  }
  const { dataset } = proxyContext;
  const subject = getNodeFromRawObject(item, proxyContext.contextUtil);
  const rdfType = proxyContext.getRdfType(subject);
  if (visitedObjects.has(subject)) {
    return proxyContext.createSubjectProxy(subject);
  }
  visitedObjects.add(subject);
  Object.entries(item).forEach(([key, value]) => {
    if (key === "@id") {
      return;
    }
    const predicate = namedNode(
      proxyContext.contextUtil.keyToIri(key, rdfType),
    );
    if (shouldDeleteOldTriples) {
      if (proxyContext.contextUtil.isLangString(key, rdfType)) {
        const languageKey = getLanguageKeyForWriteOperation(
          proxyContext.languageOrdering,
        );
        if (languageKey) {
          languageDeleteMatch(dataset, subject, predicate, languageKey);
        }
      } else {
        dataset.deleteMatches(subject, predicate);
      }
    }
    if (Array.isArray(value)) {
      value.forEach((valueItem) => {
        addRawValueToDatasetRecursive(
          subject,
          key,
          valueItem,
          visitedObjects,
          true,
          proxyContext,
        );
      });
    } else {
      addRawValueToDatasetRecursive(
        subject,
        key,
        value as RawValue,
        visitedObjects,
        true,
        proxyContext,
      );
    }
  });
  return proxyContext.createSubjectProxy(subject);
}

export function addObjectToDataset(
  item: RawObject,
  shouldDeleteOldTriples: boolean,
  proxyContext: ProxyContext,
): SubjectProxy {
  return addRawObjectToDatasetRecursive(
    item,
    new NodeSet(),
    shouldDeleteOldTriples,
    proxyContext,
  );
}
