import { LdoDataset } from "@ldo/ldo";
import type { ConnectedLdoPlugin } from "./ConnectedLdoPlugin";
import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type { ITransactionDatasetFactory } from "@ldo/subscribable-dataset";

type ReturnTypeFromArgs<T, Arg> = T extends (arg: Arg) => infer R ? R : never;

export class ConnectedLdoDataset<
  Plugins extends ConnectedLdoPlugin[],
> extends LdoDataset {
  private plugins: Plugins;

  constructor(
    plugins: Plugins,
    datasetFactory: DatasetFactory<Quad, Quad>,
    transactionDatasetFactory: ITransactionDatasetFactory<Quad>,
    initialDataset?: Dataset<Quad, Quad>,
  ) {
    super(datasetFactory, transactionDatasetFactory, initialDataset);
    this.plugins = plugins;
  }

  getResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends Parameters<Plugin["getResource"]>[0],
  >(
    _uri: UriType,
    _pluginName?: Name,
  ): ReturnTypeFromArgs<Plugin["getResource"], UriType> {
    return "eh?" as ReturnTypeFromArgs<Plugin["getResource"], UriType>;
  }
}
