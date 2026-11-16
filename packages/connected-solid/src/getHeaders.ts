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
  | GetHeadersLinkError<ResourceType>;

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
 * This error indicates that parsing `Link` header failed. It still returns raw headers
 * in `result.headers`.
 *
 * If you only care about raw headers and you deal with inconsistent response
 * `Link` header, you can still get the raw headers:
 *
 * @example
 * const resource = solidLdoDataset.getResource(URI);
 * const headersResult = await resource.getHeaders();
 *   if (
 *     !headersResult.isError ||
 *     (headersResult.isError && headersResult instanceof GetHeadersLinkError)
 *   ) {
 *     // do something with the raw headers
 *     const contentType = headersResult.headers.get("content-type")
 *   }
 * }
 */
export class GetHeadersLinkError<
  ResourceType extends SolidResource,
> extends NoncompliantPodError<ResourceType> {
  readonly headers: Headers;
  constructor(resource: ResourceType, message: string, headers: Headers) {
    super(resource, `Link header could not be parsed: ${message}`);
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
        return new GetHeadersLinkError(resource, e.message, response.headers);
      } else {
        throw e;
      }
    }
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}

/**
 * Native fetch Response Headers interface
 * enhanced with parsed link headers.
 */
export class LinkParsedHeaders extends Headers {
  /**
   * The Parsed Link header with interface of 'http-link-header' npm package.
   * https://www.npmjs.com/package/http-link-header
   */
  readonly link: LinkHeader;

  constructor(init: HeadersInit, baseUrl: string) {
    super(init);
    this.link = parseLinkHeader(this, baseUrl);
  }

  /**
   * Read a single Link Reference by "rel" parameter.
   * Please note that a Link header can have multiple Link References per "rel" parameter.
   * This method will return the first Link Reference. There is no guarantee of order.
   *
   * If you need a more flexible API, use `link` property,
   * which exposes the full interface of the 'http-link-header' npm package.
   */
  getLinkRef(rel: string): LinkHeader.Reference | undefined {
    return this.link.get("rel", rel)[0];
  }
}

export function parseLinkHeader(headers: Headers, baseUrl: string) {
  const link = LinkHeader.parse(headers.get("Link") ?? "");
  // let's make sure the uris are absolute
  link.refs.forEach((ref) => {
    // https://datatracker.ietf.org/doc/html/rfc8288#section-3.1
    ref.uri = new URL(ref.uri, baseUrl).toString();
    // https://datatracker.ietf.org/doc/html/rfc8288#section-3.2
    if (ref.anchor) ref.anchor = new URL(ref.anchor, baseUrl).toString();
  });

  return link;
}
