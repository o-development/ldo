import type { DatasetChanges } from "@ldo/rdf-utils";
import { changesToSparqlUpdate } from "@ldo/rdf-utils";
import type { Quad } from "@rdfjs/types";
import { guaranteeFetch } from "../../util/guaranteeFetch";
import type { LeafUri } from "../../util/uriTypes";
import { UnexpectedResourceError } from "../results/error/ErrorResult";
import type { HttpErrorResultType } from "../results/error/HttpErrorResult";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import type { UpdateSuccess } from "../results/success/UpdateSuccess";
import type { DatasetRequestOptions } from "./requestOptions";

/**
 * All return values for updateDataResource
 */
export type UpdateResult = UpdateSuccess | UpdateResultError;

/**
 * All errors updateDataResource can return
 */
export type UpdateResultError = HttpErrorResultType | UnexpectedResourceError;

/**
 * Updates a specific data resource with the provided dataset changes
 *
 * @param uri - the URI of the data resource
 * @param datasetChanges - A set of triples added and removed from this dataset
 * @param options - Options to provide a fetch function and a local dataset to
 * update.
 * @returns An UpdateResult
 *
 * @example
 * ```typescript
 * import {
 *   updateDataResource,
 *   transactionChanges,
 *   changeData,
 *   createSolidLdoDataset,
 * } from "@ldo/solid";
 * import { fetch } from "@inrupt/solid-client-authn-browser";
 *
 * // Initialize an LDO dataset
 * const solidLdoDataset = createSolidLdoDataset();
 * // Get a Linked Data Object
 * const profile = solidLdoDataset
 *   .usingType(ProfileShapeType)
 *   .fromSubject("https://example.com/profile#me");
 * // Create a transaction to change data
 * const cProfile = changeData(
 *   profile,
 *   solidLdoDataset.getResource("https://example.com/profile"),
 * );
 * cProfile.name = "John Doe";
 * // Get data in "DatasetChanges" form
 * const datasetChanges = transactionChanges(someLinkedDataObject);
 * // Use "updateDataResource" to apply the changes
 * const result = await updateDataResource(
 *   "https://example.com/profile",
 *   datasetChanges,
 *   { fetch, dataset: solidLdoDataset },
 * );
 * ```
 */
export async function updateDataResource(
  uri: LeafUri,
  datasetChanges: DatasetChanges<Quad>,
  options?: DatasetRequestOptions,
): Promise<UpdateResult> {
  try {
    // Optimistically add data
    options?.dataset?.bulk(datasetChanges);
    const fetch = guaranteeFetch(options?.fetch);

    // Make request
    const sparqlUpdate = await changesToSparqlUpdate(datasetChanges);
    const response = await fetch(uri, {
      method: "PATCH",
      body: sparqlUpdate,
      headers: {
        "Content-Type": "application/sparql-update",
      },
    });
    const httpError = HttpErrorResult.checkResponse(uri, response);
    if (httpError) {
      // Handle error rollback
      if (options?.dataset) {
        options.dataset.bulk({
          added: datasetChanges.removed,
          removed: datasetChanges.added,
        });
      }
      return httpError;
    }
    return {
      isError: false,
      type: "updateSuccess",
      uri,
    };
  } catch (err) {
    return UnexpectedResourceError.fromThrown(uri, err);
  }
}
