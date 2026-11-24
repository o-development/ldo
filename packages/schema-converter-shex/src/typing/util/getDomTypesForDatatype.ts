import * as dom from "dts-dom";

type StringNumberBoolean = "string" | "number" | "boolean";

export function getDomTypeforDatatype(datatype?: string): dom.Type {
  return primitiveKindToType(primitiveKindFromDatatype(datatype));
}

export function primitiveKindToType(kind: StringNumberBoolean): dom.Type {
  switch (kind) {
    case "string":
      return dom.type.string;
    case "number":
      return dom.type.number;
    case "boolean":
      return dom.type.boolean;
  }
}

export function primitiveKindFromDatatype(
  datatype?: string,
): StringNumberBoolean {
  switch (datatype) {
    case "http://www.w3.org/2001/XMLSchema#string":
    case "http://www.w3.org/2001/XMLSchema#ENTITIES":
    case "http://www.w3.org/2001/XMLSchema#ENTITY":
    case "http://www.w3.org/2001/XMLSchema#ID":
    case "http://www.w3.org/2001/XMLSchema#IDREF":
    case "http://www.w3.org/2001/XMLSchema#IDREFS":
    case "http://www.w3.org/2001/XMLSchema#language":
    case "http://www.w3.org/2001/XMLSchema#Name":
    case "http://www.w3.org/2001/XMLSchema#NCName":
    case "http://www.w3.org/2001/XMLSchema#NMTOKEN":
    case "http://www.w3.org/2001/XMLSchema#NMTOKENS":
    case "http://www.w3.org/2001/XMLSchema#normalizedString":
    case "http://www.w3.org/2001/XMLSchema#QName":
    case "http://www.w3.org/2001/XMLSchema#token":
      return "string";
    case "http://www.w3.org/2001/XMLSchema#date":
    case "http://www.w3.org/2001/XMLSchema#dateTime":
    case "http://www.w3.org/2001/XMLSchema#duration":
    case "http://www.w3.org/2001/XMLSchema#gDay":
    case "http://www.w3.org/2001/XMLSchema#gMonth":
    case "http://www.w3.org/2001/XMLSchema#gMonthDay":
    case "http://www.w3.org/2001/XMLSchema#gYear":
    case "http://www.w3.org/2001/XMLSchema#gYearMonth":
    case "http://www.w3.org/2001/XMLSchema#time":
      return "string";
    case "http://www.w3.org/2001/XMLSchema#byte":
    case "http://www.w3.org/2001/XMLSchema#decimal":
    case "http://www.w3.org/2001/XMLSchema#double":
    case "http://www.w3.org/2001/XMLSchema#float":
    case "http://www.w3.org/2001/XMLSchema#int":
    case "http://www.w3.org/2001/XMLSchema#integer":
    case "http://www.w3.org/2001/XMLSchema#long":
    case "http://www.w3.org/2001/XMLSchema#negativeInteger":
    case "http://www.w3.org/2001/XMLSchema#nonNegativeInteger":
    case "http://www.w3.org/2001/XMLSchema#nonPositiveInteger":
    case "http://www.w3.org/2001/XMLSchema#positiveInteger":
    case "http://www.w3.org/2001/XMLSchema#short":
    case "http://www.w3.org/2001/XMLSchema#unsignedLong":
    case "http://www.w3.org/2001/XMLSchema#unsignedInt":
    case "http://www.w3.org/2001/XMLSchema#unsignedShort":
    case "http://www.w3.org/2001/XMLSchema#unsignedByte":
      return "number";
    case "http://www.w3.org/2001/XMLSchema#boolean":
      return "boolean";
    case "http://www.w3.org/2001/XMLSchema#hexBinary":
    case "http://www.w3.org/2001/XMLSchema#anyURI":
    default:
      return "string";
  }
}
