import { ResourceSuccess, UnexpectedResourceError } from "@ldo/connected";
import {
  HttpErrorResult,
  NotFoundHttpError,
  type HttpErrorResultType,
} from "./requester/results/error/HttpErrorResult.js";
import LinkHeader from "http-link-header";
import type { BasicRequestOptions } from "./requester/requests/requestOptions.js";
import { guaranteeFetch } from "./util/guaranteeFetch.js";
import { NoncompliantPodError } from "./requester/results/error/NoncompliantPodError.js";
import type { SolidResource } from "./resources/SolidResource.js";

export type GetLinkHeaderResult<ResourceType extends SolidResource> =
  | GetLinkHeaderError<ResourceType>
  | GetLinkHeaderSuccess<ResourceType>;

export type GetLinkHeaderError<ResourceType extends SolidResource> =
  | HttpErrorResultType<ResourceType>
  | NotFoundHttpError<ResourceType>
  | NoncompliantPodError<ResourceType>
  | UnexpectedResourceError<ResourceType>;

export class GetLinkHeaderSuccess<
  ResourceType extends SolidResource,
> extends ResourceSuccess<ResourceType> {
  type = "getLinksSuccess" as const;

  linkHeader: LinkHeader;

  recalledFromMemory: boolean;

  constructor(
    resource: ResourceType,
    recalledFromMemory: boolean,
    linkHeader: LinkHeader,
  ) {
    super(resource);
    this.linkHeader = linkHeader;
    this.recalledFromMemory = recalledFromMemory;
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
  options?: BasicRequestOptions,
): Promise<GetLinkHeaderResult<ResourceType>> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    // Fetch options to determine the document type
    // Note cache: "no-store": we don't want to depend on cached results because
    // of inconsistencies in Solid servers
    // https://github.com/CommunitySolidServer/CommunitySolidServer/issues/1959
    // The issue has been resolved, but let's just be sure.
    const response = await fetch(resource.uri, {
      method: "HEAD",
      cache: "no-store",
    });

    const errorResult = HttpErrorResult.checkResponse(resource, response);

    if (errorResult) return errorResult;

    if (NotFoundHttpError.is(response)) {
      return new NotFoundHttpError(
        resource,
        response,
        "Could not get Link header because the resource does not exist.",
      );
    }

    const linkHeader = parseLinkHeader(response.headers);

    if (!linkHeader) {
      return new NoncompliantPodError(
        resource,
        "No link header present in request.",
      );
    }

    return new GetLinkHeaderSuccess(resource, false, linkHeader);
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}
