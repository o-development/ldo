import type { Dataset, DatasetFactory } from "@rdfjs/types";
import { SolidLdoDataset } from "./SolidLdoDataset";

import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import { createDataset, createDatasetFactory } from "@ldo/dataset";
import { ResourceStore } from "./ResourceStore";
import { guaranteeFetch } from "./util/guaranteeFetch";

/**
 * Options for createSolidDataset
 */
export interface CreateSolidLdoDatasetOptions {
  /**
   * A fetch function. Most often, this is the fetch function from @inrupt/solid-clieht-authn-js
   */
  fetch?: typeof fetch;
  /**
   * An initial dataset
   * @default A blank dataset
   */
  dataset?: Dataset;
  /**
   * An RDFJS DatasetFactory
   * @default An extended RDFJS DatasetFactory
   */
  datasetFactory?: DatasetFactory;
}

/**
 * Creates a SolidLdoDataset
 *
 * @param options - CreateSolidLdoDatasetOptions
 * @returns A SolidLdoDataset
 *
 * @example
 * ```typescript
 * import { createSolidLdoDataset } from "@ldo/solid";
 * import { fetch } from "@inrupt/solid-client-authn-browswer";
 *
 * const solidLdoDataset = createSolidLdoDataset({ fetch });
 * ```
 */
export function createSolidLdoDataset(
  options?: CreateSolidLdoDatasetOptions,
): SolidLdoDataset {
  const finalFetch = guaranteeFetch(options?.fetch);
  const finalDatasetFactory = options?.datasetFactory || createDatasetFactory();
  const finalDataset = options?.dataset || createDataset();

  // Ignoring because of circular dependency
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const context: SolidLdoDatasetContext = {
    fetch: finalFetch,
  };
  const solidLdoDataset = new SolidLdoDataset(
    context,
    finalDatasetFactory,
    finalDataset,
  );
  const resourceStore = new ResourceStore(context);
  context.solidLdoDataset = solidLdoDataset;
  context.resourceStore = resourceStore;

  return solidLdoDataset;
}
