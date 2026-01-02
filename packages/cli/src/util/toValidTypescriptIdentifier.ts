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
  if (!text) {
    return "_";
  }

  // Replace hyphens with spaces, then convert to camelCase
  // Note: We only convert hyphens, not underscores, since underscores are valid in identifiers
  const parts = text.split(/-+/);
  const camelCased = parts
    .filter((part) => part.length > 0)
    .map((part, index) => {
      if (index === 0) {
        return part;
      }
      return part[0].toUpperCase() + part.substring(1);
    })
    .join("");

  // Remove any invalid characters (keep letters, digits, underscore, dollar sign)
  const cleaned = camelCased.replace(/[^a-zA-Z0-9_$]/g, "");

  // If empty after cleaning, return a default
  if (!cleaned) {
    return "_";
  }

  // If the result starts with a digit, prepend an underscore
  if (/^[0-9]/.test(cleaned)) {
    return "_" + cleaned;
  }

  return cleaned;
}
