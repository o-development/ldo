import { ResourceSuccess, UnexpectedResourceError } from "@ldo/connected";
import {
  HttpErrorResult,
  NotFoundHttpError,
  type HttpErrorResultType,
} from "./requester/results/error/HttpErrorResult";
import type { BasicRequestOptions } from "./requester/requests/requestOptions";
import { guaranteeFetch } from "./util/guaranteeFetch";
import type { SolidResource } from "./resources/SolidResource";

export type GetHeadersResult<ResourceType extends SolidResource> =
  | GetHeadersError<ResourceType>
  | GetHeadersSuccess<ResourceType>;

export type GetHeadersError<ResourceType extends SolidResource> =
  | HttpErrorResultType<ResourceType>
  | NotFoundHttpError<ResourceType>
  | UnexpectedResourceError<ResourceType>;

export class GetHeadersSuccess<
  ResourceType extends SolidResource,
> extends ResourceSuccess<ResourceType> {
  type = "getHeadersSuccess" as const;

  headers: Response["headers"];

  constructor(resource: ResourceType, headers: Response["headers"]) {
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

    return new GetHeadersSuccess(resource, response.headers);
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}
