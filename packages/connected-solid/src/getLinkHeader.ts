import { ResourceSuccess, UnexpectedResourceError } from "@ldo/connected";
import { NotFoundHttpError } from "./requester/results/error/HttpErrorResult";
import LinkHeader from "http-link-header";
import { NoncompliantPodError } from "./requester/results/error/NoncompliantPodError";
import type { SolidResource } from "./resources/SolidResource";
import type { GetHeadersError } from "./getHeaders";

export type GetLinkHeaderResult<ResourceType extends SolidResource> =
  | GetLinkHeaderError<ResourceType>
  | GetLinkHeaderSuccess<ResourceType>;

export type GetLinkHeaderError<ResourceType extends SolidResource> =
  | GetHeadersError<ResourceType>
  | NoncompliantPodError<ResourceType>;

export class GetLinkHeaderSuccess<
  ResourceType extends SolidResource,
> extends ResourceSuccess<ResourceType> {
  type = "getLinkHeaderSuccess" as const;

  linkHeader: LinkHeader;

  constructor(resource: ResourceType, linkHeader: LinkHeader) {
    super(resource);
    this.linkHeader = linkHeader;
  }
}

/**
 * Get link headers from http Response
 */
export function parseLinkHeader(headers: Headers): LinkHeader | undefined {
  // Get the URI from the link header
  const linkHeader = headers.get("link");
  if (typeof linkHeader === "string") {
    return LinkHeader.parse(linkHeader);
  }
}

/**
 * Get Link headers of a Solid resource
 */
export async function getLinkHeader<ResourceType extends SolidResource>(
  resource: ResourceType,
): Promise<GetLinkHeaderResult<ResourceType>> {
  try {
    const headerResult = await resource.getHeaders();

    if (headerResult.isError) {
      if (headerResult.type === "notFoundError") {
        return new NotFoundHttpError(
          resource,
          headerResult.response,
          "Could not get Link header because the resource does not exist.",
        );
      } else return headerResult;
    }

    const linkHeader = parseLinkHeader(headerResult.headers);

    if (!linkHeader) {
      return new NoncompliantPodError(
        resource,
        "No link header present in request.",
      );
    }

    return new GetLinkHeaderSuccess(resource, linkHeader);
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}
