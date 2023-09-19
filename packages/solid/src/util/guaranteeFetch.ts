import crossFetch from "cross-fetch";

export function guaranteeFetch(fetchInput?: typeof fetch): typeof fetch {
  return fetchInput || crossFetch;
}
