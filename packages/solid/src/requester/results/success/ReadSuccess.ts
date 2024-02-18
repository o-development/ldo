import type { ResourceSuccess, SuccessResult } from "./SuccessResult";

/**
 * Indicates that the request to read a resource was a success
 */
export interface ReadSuccess extends ResourceSuccess {
  /**
   * True if the resource was recalled from local memory rather than a recent
   * request
   */
  recalledFromMemory: boolean;
  /**
   * True if this process also updated the container, false if not.
   */
  didContainerUpdate: boolean;
}

/**
 * Indicates that the read request was successful and that the resource
 * retrieved was a binary resource.
 */
export interface BinaryReadSuccess extends ReadSuccess {
  type: "binaryReadSuccess";
  /**
   * The raw data for the binary resource
   */
  blob: Blob;
  /**
   * The mime type of the binary resource
   */
  mimeType: string;
}

/**
 * Indicates that the read request was successful and that the resource
 * retrieved was a data (RDF) resource.
 */
export interface DataReadSuccess extends ReadSuccess {
  type: "dataReadSuccess";
}

/**
 * Indicates that the read request was successful and that the resource
 * retrieved was a container resource.
 */
export interface ContainerReadSuccess extends ReadSuccess {
  type: "containerReadSuccess";
  /**
   * True if this container is a root container
   */
  isRootContainer: boolean;
}

/**
 * Indicates that the read request was successful, but no resource exists at
 * the provided URI.
 */
export interface AbsentReadSuccess extends ReadSuccess {
  type: "absentReadSuccess";
}

/**
 * A helper function that checks to see if a result is a ReadSuccess result
 *
 * @param result - the result to check
 * @returns true if the result is a ReadSuccessResult result
 */
export function isReadSuccess(result: SuccessResult): result is ReadSuccess {
  return (
    result.type === "binaryReadSuccess" ||
    result.type === "dataReadSuccess" ||
    result.type === "absentReadSuccess" ||
    result.type === "containerReadSuccess"
  );
}
