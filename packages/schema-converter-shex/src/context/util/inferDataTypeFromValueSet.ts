import type { ObjectLiteral, valueSetValue } from "shexj";

/**
 * Infers the datatype from a value set if all ObjectLiteral values have the same type.
 * Returns undefined if:
 * - The value set is empty
 * - Values have different types
 * - Values include non-ObjectLiteral values (strings/IRIs or other complex types)
 * - ObjectLiteral values don't have a type specified
 */
export function inferDataTypeFromValueSet(
  values: valueSetValue[],
): string | undefined {
  if (values.length === 0) {
    return undefined;
  }

  let inferredType: string | undefined = undefined;

  for (const value of values) {
    // Check if value is an ObjectLiteral (has a 'value' property)
    if (typeof value !== "string" && "value" in value) {
      const objectLiteral = value as ObjectLiteral;
      if (objectLiteral.type) {
        if (inferredType === undefined) {
          inferredType = objectLiteral.type;
        } else if (inferredType !== objectLiteral.type) {
          // Different types found, cannot infer a single type
          return undefined;
        }
      } else {
        // ObjectLiteral without a type, cannot infer
        return undefined;
      }
    } else if (typeof value === "string") {
      // String value (IRI), cannot infer literal datatype
      return undefined;
    } else {
      // Other complex types (IriStem, LiteralStem, etc.), cannot infer
      return undefined;
    }
  }

  return inferredType;
}
