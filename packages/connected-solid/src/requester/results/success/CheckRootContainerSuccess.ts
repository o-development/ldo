/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SolidContainer } from "../../../resources/SolidContainer";
import {
  type ResourceCapability,
  ResourceSuccess,
  SuccessResult,
} from "@ldo/connected";

/**
 * Indicates that the request to check if a resource is the root container was
 * a success.
 */
export class CheckRootContainerSuccess extends ResourceSuccess<
  SolidContainer<any[]>
> {
  type = "checkRootContainerSuccess" as const;
  /**
   * True if this resoure is the root container
   */
  isRootContainer: boolean;

  constructor(resource: SolidContainer<any[]>, isRootContainer: boolean) {
    super(resource);
    this.isRootContainer = isRootContainer;
  }
}

/**
 * Indicates that the storage container has been successfully retrieved from the
 * webId. Call `GetStorageContainerFromWebIdSuccess.storageContainers` for a
 * list of storage containers retrieved.
 */
export class GetStorageContainerFromWebIdSuccess<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Capabilities extends ResourceCapability<string, any>[],
> extends SuccessResult {
  type = "getStorageContainerFromWebIdSuccess" as const;

  /**
   * The storage containers retrieved
   */
  storageContainers: SolidContainer<Capabilities>[];

  constructor(storageContainers: SolidContainer<Capabilities>[]) {
    super();
    this.storageContainers = storageContainers;
  }
}
