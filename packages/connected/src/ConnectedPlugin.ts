/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ConnectedContext } from "./ConnectedContext";
import type { Resource } from "./Resource";
import type { ErrorResult } from "./results/error/ErrorResult";

export interface ConnectedPlugin<
  Name extends string = any,
  UriType extends string = any,
  ResourceType extends Resource<UriType> = any,
  ContextType = any,
  CreateResourceOptions = any,
> {
  name: Name;
  getResource(uri: UriType, context: ConnectedContext<this[]>): ResourceType;
  createResource(
    context: ConnectedContext<this[]>,
    createResourceOptions?: CreateResourceOptions,
  ): Promise<ResourceType | ErrorResult>;
  isUriValid(uri: string): uri is UriType;
  normalizeUri?: (uri: UriType) => UriType;
  initialContext: ContextType;
  // This object exists to transfer typescript types. It does not need to be
  // filled out in an actual instance.
  types: {
    uri: UriType;
    context: ContextType;
    resource: ResourceType;
    createResourceOptions: CreateResourceOptions;
  };
}
