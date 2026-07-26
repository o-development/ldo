import { ResourceSuccess, UnexpectedResourceError } from "@ldo/connected";
import type { SolidResource } from "./resources/SolidResource";
import type { GetHeadersError } from "./getHeaders";

export type GetHeaderResult<ResourceType extends SolidResource> =
  | GetHeadersError<ResourceType>
  | GetHeaderSuccess<ResourceType>;

export class GetHeaderSuccess<
  ResourceType extends SolidResource,
> extends ResourceSuccess<ResourceType> {
  type = "getHeaderSuccess" as const;

  header: string | null;

  constructor(
    resource: ResourceType,
    header: ReturnType<Response["headers"]["get"]>,
  ) {
    super(resource);
    this.header = header;
  }
}

/**
 * Get a specific HTTP header of a Solid resource.
 *
 * If the resource exists but it doesn't have the requested header,
 * then the method returns getHeaderSuccessResult.header === null.
 */
export async function getHeader<ResourceType extends SolidResource>(
  resource: ResourceType,
  headerName: string,
): Promise<GetHeaderResult<ResourceType>> {
  try {
    const headersResult = await resource.getHeaders();
    if (headersResult.isError) return headersResult;
    const header = headersResult.headers.get(headerName);
    return new GetHeaderSuccess(resource, header);
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}
