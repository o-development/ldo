import type { DatasetChanges } from "@ldo/rdf-utils";
import { mergeDatasetChanges } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";
import { Requester } from "./Requester";
import type { UpdateResult } from "./requests/updateDataResource";
import { updateDataResource } from "./requests/updateDataResource";

export const UPDATE_KEY = "update";

export class LeafRequester extends Requester {
  isUpdating(): boolean {
    return this.requestBatcher.isLoading(UPDATE_KEY);
  }

  /**
   * Update the data on this resource
   * @param changes
   */
  async updateDataResource(
    changes: DatasetChanges<Quad>,
  ): Promise<UpdateResult> {
    const result = await this.requestBatcher.queueProcess({
      name: UPDATE_KEY,
      args: [
        { uri: this.uri, fetch: this.context.fetch },
        changes,
        this.context.solidLdoDataset,
      ],
      perform: updateDataResource,
      modifyQueue: (queue, isLoading, [, changes]) => {
        if (queue[queue.length - 1].name === UPDATE_KEY) {
          // Merge Changes
          const originalChanges = queue[queue.length - 1].args[1];
          mergeDatasetChanges(originalChanges, changes);
          return true;
        }
        return false;
      },
    });
    return result;
  }
}
