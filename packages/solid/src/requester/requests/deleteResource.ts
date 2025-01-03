import { namedNode } from "@rdfjs/data-model";
import { guaranteeFetch } from "../../util/guaranteeFetch";
import { deleteResourceRdfFromContainer } from "../../util/rdfUtils";
import { UnexpectedResourceError } from "../results/error/ErrorResult";
import type { HttpErrorResultType } from "../results/error/HttpErrorResult";
import { UnexpectedHttpError } from "../results/error/HttpErrorResult";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import type { DeleteSuccess } from "../results/success/DeleteSuccess";
import type { DatasetRequestOptions } from "./requestOptions";
import type { IBulkEditableDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";

/**
 * All possible return values for deleteResource
 */
export type DeleteResult = DeleteSuccess | DeleteResultError;

/**
 * All possible errors that can be returned by deleteResource
 */
export type DeleteResultError = HttpErrorResultType | UnexpectedResourceError;

/**
 * Deletes a resource on a Pod at a given URL.
 *
 * @param uri - The URI for the resource that should be deleted
 * @param options - Options to provide a fetch function and a local dataset to
 * update.
 * @returns a DeleteResult
 *
 * @example
 * `deleteResource` will send a request to a Solid Pod using the provided fetch
 * function. A local dataset can also be provided. It will be updated with any
 * new information from the delete.
 *
 * ```typescript
 * import { deleteResource } from "@ldo/solid";
 * import { createDataset } from "@ldo/dataset"
 * import { fetch } from "@inrupt/solid-client-autn-js";
 *
 * const localDataset = createDataset();
 * const result = await deleteResource(
 *   "https://example.com/container/someResource.ttl",
 *   { fetch, dataset: localDataset },
 * );
 * if (!result.isError) {
 *   // Do something
 * }
 * ```
 */
export async function deleteResource(
  uri: string,
  options?: DatasetRequestOptions,
): Promise<DeleteResult> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    const response = await fetch(uri, {
      method: "delete",
    });
    const errorResult = HttpErrorResult.checkResponse(uri, response);
    if (errorResult) return errorResult;

    // Specifically check for a 205. Annoyingly, the server will return 200 even
    // if it hasn't been deleted when you're unauthenticated. 404 happens when
    // the document never existed
    if (response.status === 205 || response.status === 404) {
      if (options?.dataset)
        updateDatasetOnSuccessfulDelete(uri, options.dataset);
      return {
        isError: false,
        type: "deleteSuccess",
        uri,
        resourceExisted: response.status === 205,
      };
    }
    return new UnexpectedHttpError(uri, response);
  } catch (err) {
    return UnexpectedResourceError.fromThrown(uri, err);
  }
}

/**
 * Assuming a successful delete has just been performed, this function updates
 * datastores to reflect that.
 *
 * @param uri - The uri of the resouce that was removed
 * @param dataset - The dataset that should be updated
 */
export function updateDatasetOnSuccessfulDelete(
  uri: string,
  dataset: IBulkEditableDataset<Quad>,
): void {
  dataset.deleteMatches(undefined, undefined, undefined, namedNode(uri));
  deleteResourceRdfFromContainer(uri, dataset);
}
