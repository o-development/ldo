import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { namedNode, literal, blankNode } from "@rdfjs/data-model";
import type { ContextUtil } from "../ContextUtil";
import { _getUnderlyingNode } from "../types";
import type { RawObject, RawValue } from "./RawObject";
import type { ProxyContext } from "../ProxyContext";

export function getNodeFromRawObject(
  item: RawObject,
  contextUtil: ContextUtil,
): NamedNode | BlankNode {
  if (item[_getUnderlyingNode]) {
    return item[_getUnderlyingNode] as NamedNode | BlankNode;
  } else if (!item["@id"]) {
    return blankNode();
  } else if (typeof item["@id"] === "string") {
    // Purposly do not include typeName because we don't want to reference
    // nested context
    return namedNode(contextUtil.keyToIri(item["@id"], []));
  } else {
    return item["@id"];
  }
}

export function getNodeFromRawValue(
  key: string,
  value: RawValue,
  rdfTypes: NamedNode[],
  proxyContext: ProxyContext,
): BlankNode | NamedNode | Literal | undefined {
  // Get the Object Node
  if (value == undefined) {
    return undefined;
  } else if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    // PICKUP: figure out how to handle looking for the RDF Types of a raw value
    const datatype = proxyContext.contextUtil.getDataType(key, rdfTypes);
    if (datatype === "@id") {
      return namedNode(value.toString());
    } else {
      return literal(value.toString(), datatype);
    }
  } else {
    return getNodeFromRawObject(value, proxyContext.contextUtil);
  }
}
