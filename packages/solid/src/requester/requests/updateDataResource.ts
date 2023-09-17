import type { DatasetChanges } from "@ldo/rdf-utils";
import { changesToSparqlUpdate } from "@ldo/rdf-utils";
import { DataResult } from "../requestResults/DataResult";
import type { HttpErrorResultType } from "../requestResults/HttpErrorResult";
import { HttpErrorResult } from "../requestResults/HttpErrorResult";
import { UnexpectedError } from "../requestResults/ErrorResult";
import type { SimpleRequestParams } from "./requestParams";
import type { SubscribableDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";

export type UpdateResult = DataResult | UpdateResultError;
export type UpdateResultError = HttpErrorResultType | UnexpectedError;

export async function updateDataResource(
  { uri, fetch }: SimpleRequestParams,
  datasetChanges: DatasetChanges<Quad>,
  mainDataset: SubscribableDataset<Quad>,
): Promise<UpdateResult> {
  try {
    // Put Changes in transactional dataset
    const transaction = mainDataset.startTransaction();
    transaction.addAll(datasetChanges.added || []);
    datasetChanges.removed?.forEach((quad) => transaction.delete(quad));
    // Commit data optimistically
    transaction.commit();
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
      transaction.rollback();
      return httpError;
    }
    return new DataResult(uri);
  } catch (err) {
    return UnexpectedError.fromThrown(uri, err);
  }
}
