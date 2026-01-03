import type { ObjectLiteral, valueSetValue } from "shexj";

/**
 * Type guard to check if a valueSetValue is an ObjectLiteral.
 * ObjectLiteral has a required 'value' property of type string.
 */
function isObjectLiteral(value: valueSetValue): value is ObjectLiteral {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof (value as ObjectLiteral).value === "string"
  );
}

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
    if (isObjectLiteral(value)) {
      if (value.type) {
        if (inferredType === undefined) {
          inferredType = value.type;
        } else if (inferredType !== value.type) {
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
