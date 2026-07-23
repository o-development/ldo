import { UnexpectedResourceError } from "@ldo/connected";
import type { SolidLeafUri } from "../../types";
import type {
  HttpErrorResultType,
  NotFoundHttpError,
} from "../results/error/HttpErrorResult";
import { NoncompliantPodError } from "../results/error/NoncompliantPodError";
import { GetStorageDescriptionUriSuccess } from "../results/success/StorageDescriptionSuccess";
import type { SolidContainer } from "../../resources/SolidContainer.js";
import type { SolidLeaf } from "../../resources/SolidLeaf.js";

export type GetStorageDescriptionUriError<
  ResourceType extends SolidContainer | SolidLeaf,
> =
  | HttpErrorResultType<ResourceType>
  | NotFoundHttpError<ResourceType>
  | NoncompliantPodError<ResourceType>
  | UnexpectedResourceError<ResourceType>;
export type GetStorageDescriptionUriResult<
  ResourceType extends SolidContainer | SolidLeaf,
> =
  | GetStorageDescriptionUriSuccess
  | GetStorageDescriptionUriError<ResourceType>;

/**
 * Get storage description URI from resource Link headers
 *
 * @param resource - Solid resource we start from
 * @param options - Options object that may contain custom (authenticated) fetch
 *
 * @returns GetStorageDescriptionUriResult
 *
 * https://solidproject.org/TR/protocol#server-storage-description
 */
export async function getStorageDescriptionUri(
  resource: SolidLeaf | SolidContainer,
): Promise<GetStorageDescriptionUriResult<SolidLeaf | SolidContainer>> {
  try {
    const linkHeaderResult = await resource.getLinkHeader();
    if (linkHeaderResult.isError) return linkHeaderResult;

    const storageDescriptionLinks = linkHeaderResult.linkHeader.get(
      "rel",
      "http://www.w3.org/ns/solid/terms#storageDescription",
    );

    if (storageDescriptionLinks.length !== 1) {
      return new NoncompliantPodError(
        resource,
        'There must be one link with a rel="http://www.w3.org/ns/solid/terms#storageDescription"',
      );
    }

    return new GetStorageDescriptionUriSuccess(
      resource,
      storageDescriptionLinks[0].uri as SolidLeafUri,
    );
  } catch (e) {
    return UnexpectedResourceError.fromThrown(resource, e);
  }
}
