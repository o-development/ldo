import { guaranteeFetch } from "../../util/guaranteeFetch";
import {
  addResourceRdfToContainer,
  getParentUri,
  getSlug,
} from "../../util/rdfUtils";
import type { LeafUri } from "../../util/uriTypes";
import { UnexpectedResourceError } from "../results/error/ErrorResult";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import type {
  LeafCreateAndOverwriteResult,
  LeafCreateIfAbsentResult,
} from "./createDataResource";
import { deleteResource } from "./deleteResource";
import { readResource } from "./readResource";
import type { DatasetRequestOptions } from "./requestOptions";

/**
 * Uploads a binary resource at the provided URI
 *
 * @param uri - The URI of the resource
 * @param overwrite - If true, the request will overwrite any previous resource
 * at this URI.
 * @param options - Options to provide a fetch function and a local dataset to
 * update.
 * @returns One of many create results depending on the input
 *
 * @example
 * Any local RDFJS dataset passed to the `options` field will be updated with
 * any new RDF data from the create process.
 *
 * ```typescript
 * import { createDataResource } from "@ldo/solid";
 * import { createDataset } from "@ldo/dataset"
 * import { fetch } from "@inrupt/solid-client-autn-js";
 *
 * const localDataset = createDataset();
 * const result = await uploadResource(
 *   "https://example.com/container/someResource.txt",
 *   new Blob("some text."),
 *   "text/txt",
 *   true,
 *   { fetch, dataset: localDataset },
 * );
 * if (!result.isError) {
 *   // Do something
 * }
 * ```
 */
export function uploadResource(
  uri: LeafUri,
  blob: Blob,
  mimeType: string,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<LeafCreateAndOverwriteResult>;
export function uploadResource(
  uri: LeafUri,
  blob: Blob,
  mimeType: string,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult>;
export function uploadResource(
  uri: LeafUri,
  blob: Blob,
  mimeType: string,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult | LeafCreateAndOverwriteResult>;
export async function uploadResource(
  uri: LeafUri,
  blob: Blob,
  mimeType: string,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult | LeafCreateAndOverwriteResult> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    let didOverwrite = false;
    if (overwrite) {
      const deleteResult = await deleteResource(uri, options);
      // Return if it wasn't deleted
      if (deleteResult.isError) return deleteResult;
      didOverwrite = deleteResult.resourceExisted;
    } else {
      // Perform a read to check if it exists
      const readResult = await readResource(uri, options);
      // If it does exist stop and return.
      if (readResult.type !== "absentReadSuccess") {
        return readResult;
      }
    }
    // Create the document
    const parentUri = getParentUri(uri)!;
    const response = await fetch(parentUri, {
      method: "post",
      headers: {
        "content-type": mimeType,
        slug: getSlug(uri),
      },
      body: blob,
    });

    const httpError = HttpErrorResult.checkResponse(uri, response);
    if (httpError) return httpError;

    if (options?.dataset) {
      addResourceRdfToContainer(uri, options.dataset);
    }
    return {
      isError: false,
      type: "createSuccess",
      uri,
      didOverwrite,
    };
  } catch (err) {
    const thing = UnexpectedResourceError.fromThrown(uri, err);
    return thing;
  }
}
