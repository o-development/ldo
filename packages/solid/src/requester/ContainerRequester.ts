import { Requester } from "./Requester";
import type { CheckRootResult } from "./requests/checkRootContainer";
import { checkRootContainer } from "./requests/checkRootContainer";

export const IS_ROOT_CONTAINER_KEY = "isRootContainer";

export class ContainerRequester extends Requester {
  async isRootContainer(): Promise<CheckRootResult> {
    return this.requestBatcher.queueProcess({
      name: IS_ROOT_CONTAINER_KEY,
      args: [{ uri: this.uri, fetch: this.context.fetch }],
      perform: checkRootContainer,
      modifyQueue: (queue, isLoading) => {
        if (queue.length === 0) {
          return isLoading[IS_ROOT_CONTAINER_KEY];
        } else {
          return queue[queue.length - 1].name === IS_ROOT_CONTAINER_KEY;
        }
      },
    });
  }
}
