import { guaranteeFetch } from "../../util/guaranteeFetch";
import { UnexpectedResourceError } from "@ldo/connected";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import type {
  LeafCreateAndOverwriteResult,
  LeafCreateIfAbsentResult,
} from "./createDataResource";
import { readResource } from "./readResource";
import type { DatasetRequestOptions } from "./requestOptions";
import type { SolidLeaf } from "../../resources/SolidLeaf";
import { CreateSuccess } from "../results/success/CreateSuccess";
import { addResourceRdfToContainer } from "../../util/rdfUtils";
import { NoncompliantPodError } from "../results/error/NoncompliantPodError.js";

/**
 * @internal
 * Uploads a binary resource at the provided URI
 *
 * @param uri - The URI of the resource
 * @param overwrite - If true, the request will overwrite any previous resource
 * at this URI.
 * @param options - Options to provide a fetch function and a local dataset to
 * update.
 * @returns One of many create results depending on the input
 */
export function uploadResource(
  resource: SolidLeaf,
  blob: Blob,
  mimeType: string,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<LeafCreateAndOverwriteResult>;
export function uploadResource(
  resource: SolidLeaf,
  blob: Blob,
  mimeType: string,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult>;
export async function uploadResource(
  resource: SolidLeaf,
  blob: Blob,
  mimeType: string,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult | LeafCreateAndOverwriteResult> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    const headers: HeadersInit = {
      "content-type": mimeType,
    };

    if (!overwrite) {
      // https://solidproject.org/TR/protocol#conditional-update
      // https://www.rfc-editor.org/info/rfc9110/#section-13.1.2
      headers["If-None-Match"] = "*";
    }

    // Create the document
    const response = await fetch(resource.uri, {
      method: "PUT",
      headers,
      body: blob,
    });

    // Check whether If-None-Match: "*" precondition failed.
    // That means we tried to overwrite existing resource when overwriting is forbidden.
    if (response.status === 412) {
      const result = await readResource(resource, options);
      if (result.type === "absentReadSuccess")
        return new NoncompliantPodError(
          resource,
          `Server returned conflicting states: Response status 412 implies the resource ${resource.uri} exists, but it is absent.`,
        );
      return result;
    }

    const httpError = HttpErrorResult.checkResponse(resource, response);
    if (httpError) return httpError;

    const didOverwrite = response.status !== 201;

    if (options?.dataset) {
      addResourceRdfToContainer(resource.uri, options.dataset);
    }
    return new CreateSuccess(resource, didOverwrite);
  } catch (err) {
    const thing = UnexpectedResourceError.fromThrown(resource, err);
    return thing;
  }
}
