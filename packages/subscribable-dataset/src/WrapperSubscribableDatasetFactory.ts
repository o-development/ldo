import type { DatasetFactory, BaseQuad, Dataset } from "@rdfjs/types";
import WrapperSubscribableDataset from "./WrapperSubscribableDataset";

/**
 * A DatasetFactory that returns a WrapperSubscribableDataset given a generic DatasetFactory.
 */
export default class WrapperSubscribableDatasetFactory<
  InAndOutQuad extends BaseQuad = BaseQuad,
> implements DatasetFactory<InAndOutQuad, InAndOutQuad>
{
  private datasetFactory: DatasetFactory<InAndOutQuad, InAndOutQuad>;
  constructor(datasetFactory: DatasetFactory<InAndOutQuad, InAndOutQuad>) {
    this.datasetFactory = datasetFactory;
  }

  dataset(
    quads?: Dataset<InAndOutQuad, InAndOutQuad> | InAndOutQuad[],
  ): WrapperSubscribableDataset<InAndOutQuad> {
    // Typings are wrong
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new WrapperSubscribableDataset(
      this.datasetFactory,
      quads ? this.datasetFactory.dataset(quads) : undefined,
    );
  }
}
