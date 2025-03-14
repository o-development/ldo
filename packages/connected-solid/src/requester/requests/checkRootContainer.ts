import type { BasicRequestOptions } from "./requestOptions";
import { parse as parseLinkHeader } from "http-link-header";
import { CheckRootContainerSuccess } from "../results/success/CheckRootContainerSuccess";
import type {
  HttpErrorResultType,
  UnexpectedHttpError,
} from "../results/error/HttpErrorResult";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import { UnexpectedResourceError } from "@ldo/connected";
import type { SolidContainer } from "../../resources/SolidContainer";
import { guaranteeFetch } from "../../util/guaranteeFetch";

/**
 * checkRootContainer result
 */
export type CheckRootResult = CheckRootContainerSuccess | CheckRootResultError;

/**
 * All possible errors checkRootResult can return
 */
export type CheckRootResultError =
  | HttpErrorResultType<SolidContainer>
  | UnexpectedHttpError<SolidContainer>
  | UnexpectedResourceError<SolidContainer>;

/**
 * @internal
 * Checks provided headers to see if a given URI is a root container as defined
 * in the [solid specification section 4.1](https://solidproject.org/TR/protocol#storage-resource)
 *
 * @param uri - the URI of the container resource
 * @param headers - headers returned when making a GET request to the resource
 * @returns CheckRootContainerSuccess if there is not error
 */
export function checkHeadersForRootContainer(
  resource: SolidContainer,
  headers: Headers,
): CheckRootContainerSuccess {
  const linkHeader = headers.get("link");
  if (!linkHeader) {
    return new CheckRootContainerSuccess(resource, false);
  }
  const parsedLinkHeader = parseLinkHeader(linkHeader);
  const types = parsedLinkHeader.get("rel", "type");
  const isRootContainer = types.some(
    (type) => type.uri === "http://www.w3.org/ns/pim/space#Storage",
  );
  return new CheckRootContainerSuccess(resource, isRootContainer);
}

/**
 * Performs a request to the Pod to check if the given URI is a root container
 * as defined in the [solid specification section 4.1](https://solidproject.org/TR/protocol#storage-resource)
 *
 * @param uri - the URI of the container resource
 * @param options - options variable to pass a fetch function
 * @returns CheckResourceSuccess if there is no error
 *
 * @example
 * ```typescript
 * import { checkRootContainer } from "@ldo/solid";
 * import { fetch } from "@inrupt/solid-client-authn-browser";
 *
 * const result = await checkRootContainer("https://example.com/", { fetch });
 * if (!result.isError) {
 *   // true if the container is a root container
 *   console.log(result.isRootContainer);
 * }
 * ```
 */
export async function checkRootContainer(
  resource: SolidContainer,
  options?: BasicRequestOptions,
): Promise<CheckRootResult> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    // Fetch options to determine the document type
    // Note cache: "no-store": we don't want to depend on cached results because
    // web browsers do not cache link headers
    // https://github.com/CommunitySolidServer/CommunitySolidServer/issues/1959
    const response = await fetch(resource.uri, {
      method: "HEAD",
      cache: "no-store",
    });
    const httpErrorResult = HttpErrorResult.checkResponse(resource, response);
    if (httpErrorResult) return httpErrorResult;

    return checkHeadersForRootContainer(resource, response.headers);
  } catch (err) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}
