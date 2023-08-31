import type { LanguageOrdering } from "./language/languageTypes";
import type { InteractOptions } from "./util/createInteractOptions";
import { createInteractOptions } from "./util/createInteractOptions";

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
