/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IConnectedLdoDataset } from "@ldo/connected";
import type { SolidConnectedPlugin } from "@ldo/connected-solid";
import { guaranteeFetch } from "@ldo/connected-solid";
import { createSolidLdoDataset } from "@ldo/wac";

export interface Options {
  solidLdoDataset?: IConnectedLdoDataset<SolidConnectedPlugin<any[]>[]>;
  fetch?: typeof fetch;
}

export function guaranteeOptions(options?: Options): {
  fetch: typeof globalThis.fetch;
  dataset: ReturnType<typeof createSolidLdoDataset>;
} {
  const fetch = guaranteeFetch(options?.fetch);
  const dataset = (options?.solidLdoDataset ??
    createSolidLdoDataset()) as ReturnType<typeof createSolidLdoDataset>;
  dataset.setContext("solid", { fetch });
  return { fetch, dataset };
}
