import type { BasicRequestOptions } from "./requestOptions";
import type LinkHeader from "http-link-header";
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
  linkHeader: LinkHeader,
): CheckRootContainerSuccess {
  const types = linkHeader.get("rel", "type");
  const isRootContainer = types.some(
    (type) => type.uri === "http://www.w3.org/ns/pim/space#Storage",
  );
  return new CheckRootContainerSuccess(resource, isRootContainer);
}

/**
 * @internal
 *
 * Performs a request to the Pod to check if the given URI is a root container
 * as defined in the [solid specification section 4.1](https://solidproject.org/TR/protocol#storage-resource)
 *
 * @param resource - the the container resource
 * @param options - options variable to pass a fetch function
 * @returns CheckResourceSuccess if there is no error
 */
export async function checkRootContainer(
  resource: SolidContainer,
): Promise<CheckRootResult> {
  try {
    const linkHeaderResult = await resource.getLinkHeader();
    if (linkHeaderResult.isError) {
      if (
        linkHeaderResult.type === "noncompliantPodError" ||
        linkHeaderResult.type === "notFoundError"
      )
        return new CheckRootContainerSuccess(resource, false);
      return linkHeaderResult;
    }

    return checkHeadersForRootContainer(resource, linkHeaderResult.linkHeader);
  } catch (err) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}
