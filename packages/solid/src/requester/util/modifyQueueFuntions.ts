/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WaitingProcess } from "../../util/RequestBatcher";

export function modifyQueueByMergingEventsWithTheSameKeys(key: string) {
  return (
    queue: WaitingProcess<any[], any>[],
    currentlyLoading: WaitingProcess<any[], any> | undefined,
  ) => {
    if (queue.length === 0 && currentlyLoading?.name === key) {
      return currentlyLoading;
    } else if (queue[queue.length - 1]?.name === key) {
      return queue[queue.length - 1];
    }
    return undefined;
  };
}
