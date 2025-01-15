import { createSolidLdoDataset } from "@ldo/solid";
import type { ISolidLdoDataset } from "@ldo/solid";
import { guaranteeFetch } from "@ldo/solid/dist/util/guaranteeFetch";

export interface Options {
  solidLdoDataset?: ISolidLdoDataset;
  fetch?: typeof fetch;
}

export function guaranteeOptions(options?: Options) {
  const fetch = guaranteeFetch(options?.fetch);
  const dataset = options?.solidLdoDataset ?? createSolidLdoDataset({ fetch });
  return { fetch, dataset };
}
