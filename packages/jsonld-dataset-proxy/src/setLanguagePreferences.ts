import type { LanguageOrdering } from "./language/languageTypes.js";
import type { InteractOptions } from "./util/createInteractOptions.js";
import { createInteractOptions } from "./util/createInteractOptions.js";

/**
 * Set the default language pr
 * @param graphs The graphs that should be written to
 * @returns a write builder
 */
export function setLanguagePreferences(
  ...languageOrdering: LanguageOrdering
): InteractOptions {
  return createInteractOptions("languageOrdering", languageOrdering);
}
