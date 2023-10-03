import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type { ContainerUri } from "../util/uriTypes";
import { Requester } from "./Requester";
import type { CheckRootResult } from "./requests/checkRootContainer";
import { checkRootContainer } from "./requests/checkRootContainer";
import type {
  ContainerCreateAndOverwriteResult,
  ContainerCreateIfAbsentResult,
} from "./requests/createDataResource";
import type { ReadContainerResult } from "./requests/readResource";

export const IS_ROOT_CONTAINER_KEY = "isRootContainer";

export class ContainerRequester extends Requester {
  readonly uri: ContainerUri;

  constructor(uri: ContainerUri, context: SolidLdoDatasetContext) {
    super(context);
    this.uri = uri;
  }

  read(): Promise<ReadContainerResult> {
    return super.read() as Promise<ReadContainerResult>;
  }

  createDataResource(
    overwrite: true,
  ): Promise<ContainerCreateAndOverwriteResult>;
  createDataResource(overwrite?: false): Promise<ContainerCreateIfAbsentResult>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<
    ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult
  > {
    return super.createDataResource(overwrite) as Promise<
      ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult
    >;
  }

  async isRootContainer(): Promise<CheckRootResult> {
    return this.requestBatcher.queueProcess({
      name: IS_ROOT_CONTAINER_KEY,
      args: [this.uri as ContainerUri, { fetch: this.context.fetch }],
      perform: checkRootContainer,
      modifyQueue: (queue, currentlyLoading) => {
        if (
          queue.length === 0 &&
          currentlyLoading?.name === IS_ROOT_CONTAINER_KEY
        ) {
          return currentlyLoading;
        } else if (queue[queue.length - 1]?.name === IS_ROOT_CONTAINER_KEY) {
          return queue[queue.length - 1];
        }
        return undefined;
      },
    });
  }
}
