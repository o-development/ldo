import { LdoDataset } from "@ldo/ldo";
import type { Dataset, DatasetFactory } from "@rdfjs/types";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";

export class SolidLdoDataset extends LdoDataset {
  public context: SolidLdoDatasetContext;

  constructor(
    context: SolidLdoDatasetContext,
    datasetFactory: DatasetFactory,
    initialDataset?: Dataset,
  ) {
    super(datasetFactory, initialDataset);
    this.context = context;
  }

  // getResourceStatus(): ResourceStatus {
  //   throw new Error("Not Implemented");
  // }
}
