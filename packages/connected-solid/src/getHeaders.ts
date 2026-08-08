import { ResourceSuccess, UnexpectedResourceError } from "@ldo/connected";
import {
  HttpErrorResult,
  NotFoundHttpError,
  type HttpErrorResultType,
} from "./requester/results/error/HttpErrorResult";
import type { BasicRequestOptions } from "./requester/requests/requestOptions";
import { guaranteeFetch } from "./util/guaranteeFetch";
import type { SolidResource } from "./resources/SolidResource";
import LinkHeader from "http-link-header";
import { NoncompliantPodError } from "./requester/results/error/NoncompliantPodError";

export type GetHeadersResult<ResourceType extends SolidResource> =
  | GetHeadersError<ResourceType>
  | GetHeadersSuccess<ResourceType>;

export type GetHeadersError<ResourceType extends SolidResource> =
  | HttpErrorResultType<ResourceType>
  | NotFoundHttpError<ResourceType>
  | UnexpectedResourceError<ResourceType>
  | NoncompliantPodError<ResourceType>;

export class GetHeadersSuccess<
  ResourceType extends SolidResource,
> extends ResourceSuccess<ResourceType> {
  type = "getHeadersSuccess" as const;

  headers: LinkParsedHeaders;

  constructor(resource: ResourceType, headers: LinkParsedHeaders) {
    super(resource);
    this.headers = headers;
  }
}

/**
 * Get HTTP headers of a Solid resource
 */
export async function getHeaders<ResourceType extends SolidResource>(
  resource: ResourceType,
  options?: BasicRequestOptions,
): Promise<GetHeadersResult<ResourceType>> {
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
        "Could not get HTTP headers because the resource does not exist.",
      );
    }

    try {
      const headers = new LinkParsedHeaders(response.headers, response.url);
      return new GetHeadersSuccess(resource, headers);
    } catch (e) {
      if (e instanceof Error) {
        return new NoncompliantPodError(
          resource,
          "Parsing Link header failed: " + e.message,
        );
      } else {
        throw e;
      }
    }
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}

export class LinkParsedHeaders extends Headers {
  link: LinkHeader;

  constructor(init: HeadersInit, baseUrl: string) {
    super(init);
    this.link = parseLinkHeader(this, baseUrl);
  }

  getLinkHeader(name: string): LinkHeader.Reference[] {
    return this.link.get("rel", name);
  }
}

export function parseLinkHeader(headers: Headers, baseUrl: string) {
  const link = LinkHeader.parse(headers.get("Link") ?? "");
  // let's make sure the uris are absolute
  link.refs.forEach((ref) => {
    // https://datatracker.ietf.org/doc/html/rfc8288#section-3.1
    if (ref.uri) ref.uri = new URL(ref.uri, baseUrl).toString();
    // https://datatracker.ietf.org/doc/html/rfc8288#section-3.2
    if (ref.anchor) ref.anchor = new URL(ref.anchor, baseUrl).toString();
  });

  return link;
}
