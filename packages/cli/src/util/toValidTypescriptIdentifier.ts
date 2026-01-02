/**
 * Converts a string to a valid TypeScript identifier by removing or replacing
 * characters that are not allowed in identifiers.
 *
 * TypeScript identifiers must:
 * - Start with a letter, underscore, or dollar sign
 * - Contain only letters, digits, underscores, or dollar signs
 *
 * This function converts hyphens to camelCase and removes other invalid characters.
 *
 * @param text - The input string to convert
 * @returns A valid TypeScript identifier
 */
export function toValidTypescriptIdentifier(text: string): string {
  // Replace hyphens and underscores with spaces, then convert to camelCase
  const camelCased = text
    .replace(/([-_]){1,}/g, " ")
    .split(/[-_ ]/)
    .reduce((cur, acc) => {
      return cur + acc[0].toUpperCase() + acc.substring(1);
    });

  // Remove any remaining invalid characters (keep letters, digits, underscore, dollar sign)
  const cleaned = camelCased.replace(/[^a-zA-Z0-9_$]/g, "");

  // If the result starts with a digit, prepend an underscore
  if (/^[0-9]/.test(cleaned)) {
    return "_" + cleaned;
  }

  return cleaned;
}
