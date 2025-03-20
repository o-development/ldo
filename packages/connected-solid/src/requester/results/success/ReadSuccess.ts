import { ResourceSuccess } from "@ldo/connected";
import type { Resource, ResourceResult } from "@ldo/connected";
import type { SolidLeaf } from "../../../resources/SolidLeaf";
import type { SolidContainer } from "../../../resources/SolidContainer";

/**
 * Indicates that the request to read a resource was a success
 */
export abstract class ReadSuccess<
  ResourceType extends Resource,
> extends ResourceSuccess<ResourceType> {
  /**
   * True if the resource was recalled from local memory rather than a recent
   * request
   */
  recalledFromMemory: boolean;

  constructor(resource: ResourceType, recalledFromMemory: boolean) {
    super(resource);
    this.recalledFromMemory = recalledFromMemory;
  }
}

/**
 * Indicates that the read request was successful and that the resource
 * retrieved was a binary resource.
 */
export class BinaryReadSuccess extends ReadSuccess<SolidLeaf> {
  type = "binaryReadSuccess" as const;
  /**
   * The raw data for the binary resource
   */
  blob: Blob;
  /**
   * The mime type of the binary resource
   */
  mimeType: string;

  constructor(
    resource: SolidLeaf,
    recalledFromMemory: boolean,
    blob: Blob,
    mimeType: string,
  ) {
    super(resource, recalledFromMemory);
    this.blob = blob;
    this.mimeType = mimeType;
  }
}

/**
 * Indicates that the read request was successful and that the resource
 * retrieved was a data (RDF) resource.
 */
export class DataReadSuccess extends ReadSuccess<SolidLeaf> {
  type = "dataReadSuccess" as const;
}

/**
 * Indicates that the read request was successful and that the resource
 * retrieved was a container resource.
 */
export class ContainerReadSuccess extends ReadSuccess<SolidContainer> {
  type = "containerReadSuccess" as const;
  /**
   * True if this container is a root container
   */
  isRootContainer: boolean;

  constructor(
    resource: SolidContainer,
    recalledFromMemory: boolean,
    isRootContainer: boolean,
  ) {
    super(resource, recalledFromMemory);
    this.isRootContainer = isRootContainer;
  }
}

/**
 * Indicates that the read request was successful, but no resource exists at
 * the provided URI.
 */
export class AbsentReadSuccess<
  ResourceType extends Resource,
> extends ReadSuccess<ResourceType> {
  type = "absentReadSuccess" as const;
}

/**
 * A helper function that checks to see if a result is a ReadSuccess result
 *
 * @param result - the result to check
 * @returns true if the result is a ReadSuccessResult result
 */
export function isReadSuccess<ResourceType extends Resource>(
  result: ResourceResult<Resource>,
): result is ReadSuccess<ResourceType> {
  return (
    result.type === "binaryReadSuccess" ||
    result.type === "dataReadSuccess" ||
    result.type === "absentReadSuccess" ||
    result.type === "containerReadSuccess"
  );
}
