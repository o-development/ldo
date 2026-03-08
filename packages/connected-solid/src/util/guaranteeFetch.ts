/**
 * @internal
 * Guantees that some kind of fetch is available
 *
 * @param fetchInput - A potential fetch object
 * @returns a proper fetch object. Global fetch is default
 */
export function guaranteeFetch(fetchInput?: typeof fetch): typeof fetch {
  return fetchInput || fetch;
}
