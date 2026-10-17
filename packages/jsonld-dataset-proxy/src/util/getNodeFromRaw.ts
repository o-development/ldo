import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { blankNode, namedNode, literal } from "@ldo/rdf-utils";
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
  value: RawValue,
  proxyContext: ProxyContext,
  // To get this run proxyContext.contextUtil.getDataType(key, proxyContext.getRdfType(subjectNode))
  datatype?: string,
): BlankNode | NamedNode | Literal | undefined {
  // Get the Object Node
  if (value == undefined) {
    return undefined;
  } else if (value instanceof Date) {
    if (!datatype || datatype === "@id") {
      // Dates cannot be used as named node identifiers
      return undefined;
    } else if (datatype === "http://www.w3.org/2001/XMLSchema#date") {
      // Format as date-only (YYYY-MM-DD) for xsd:date
      const dateString = value.toISOString().split("T")[0];
      return literal(dateString, datatype);
    } else if (datatype === "http://www.w3.org/2001/XMLSchema#dateTime") {
      // Use full ISO format for xsd:dateTime
      return literal(value.toISOString(), datatype);
    } else {
      // For non-date-related datatypes, do not coerce Date values
      return undefined;
    }
  } else if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    if (!datatype) {
      return undefined;
    } else if (datatype === "@id") {
      return namedNode(value.toString());
    } else {
      return literal(value.toString(), datatype);
    }
  } else if (
    typeof value.termType === "string" &&
    (value.termType === "NamedNode" || value.termType === "BlankNode")
  ) {
    return value as NamedNode | BlankNode;
  } else {
    return getNodeFromRawObject(value as RawObject, proxyContext.contextUtil);
  }
}
