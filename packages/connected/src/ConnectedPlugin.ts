import type { ConnectedContext } from "./ConnectedContext";
import type { Resource } from "./Resource";
import type { ErrorResult } from "./results/error/ErrorResult";

export interface ConnectedPlugin<
  Name extends string,
  UriType extends string,
  ResourceType extends Resource<UriType>,
  ContextType,
> {
  name: Name;
  getResource(uri: UriType, context: ConnectedContext<this[]>): ResourceType;
  createResource(
    context: ConnectedContext<this[]>,
  ): Promise<ResourceType | ErrorResult>;
  isUriValid(uri: UriType): uri is UriType;
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
