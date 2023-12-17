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

export type UpdateResult = UpdateSuccess | UpdateResultError;
export type UpdateResultError = HttpErrorResultType | UnexpectedResourceError;

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
