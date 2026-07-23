import { NotFoundHttpError } from "../requester/results/error/HttpErrorResult";
import type { HttpErrorResultType } from "../requester/results/error/HttpErrorResult";
import { GetWacUriSuccess } from "./results/GetWacUriSuccess";
import { UnexpectedResourceError } from "@ldo/connected";
import { NoncompliantPodError } from "../requester/results/error/NoncompliantPodError";
import type { SolidContainer } from "../resources/SolidContainer";
import type { SolidLeaf } from "../resources/SolidLeaf";
import type { SolidLeafUri } from "../types";

export type GetWacUriError<ResourceType extends SolidContainer | SolidLeaf> =
  | HttpErrorResultType<ResourceType>
  | NotFoundHttpError<ResourceType>
  | NoncompliantPodError<ResourceType>
  | UnexpectedResourceError<ResourceType>;
export type GetWacUriResult<ResourceType extends SolidContainer | SolidLeaf> =
  | GetWacUriSuccess<ResourceType>
  | GetWacUriError<ResourceType>;

/**
 * Get the URI for the WAC rules of a specific resource
 * @param resourceUri: the URI of the resource
 * @param options: Options object to include an authenticated fetch function
 * @returns GetWacUriResult
 */
export async function getWacUri(
  resource: SolidLeaf | SolidContainer,
): Promise<GetWacUriResult<SolidLeaf | SolidContainer>> {
  try {
    const linkHeaderResult = await resource.getLinkHeader();

    if (linkHeaderResult.type === "notFoundError") {
      linkHeaderResult;
      // update message of the not found error
      return new NotFoundHttpError(
        resource,
        linkHeaderResult.response,
        "Could not get access control rules because the resource does not exist.",
      );
    }

    if (linkHeaderResult.isError) {
      return linkHeaderResult as GetWacUriError<SolidLeaf | SolidContainer>;
    }

    const aclUris = linkHeaderResult.linkHeader.get("rel", "acl");
    if (aclUris.length !== 1) {
      return new NoncompliantPodError(
        resource,
        `There must be one link with a rel="acl"`,
      );
    }

    return new GetWacUriSuccess(resource, aclUris[0].uri as SolidLeafUri);
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}
