import type { Resource } from "./Resource";
import type { ErrorResult } from "./results/error/ErrorResult";

export interface ConnectedPlugin<
  Name extends string,
  UriType extends string,
  ResourceType extends Resource<UriType>,
  ContextType,
> {
  name: Name;
  getResource(uri: UriType, context: ContextType): ResourceType | ErrorResult;
  createResource(context: ContextType): Promise<ResourceType | ErrorResult>;
  isUriValid(uri: UriType): boolean;
  normalizeUri?: (uri: UriType) => UriType;
  initialContext: ContextType;
  // This object exists to transfer typescript types. It does not need to be
  // filled out in an actual instance.
  types: {
    uri: UriType;
    context: ContextType;
    resource: ResourceType;
  };
}
