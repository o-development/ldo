import { LdoDataset } from "@ldo/ldo";
import type { Dataset, DatasetFactory } from "@rdfjs/types";
import type { Container } from "./resource/Container";
import type { Leaf } from "./resource/Leaf";
import type { Resource } from "./resource/Resource";
import type { ResourceGetterOptions } from "./ResourceStore";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import type { ContainerUri, LeafUri } from "./util/uriTypes";

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

  getResource(uri: ContainerUri, options?: ResourceGetterOptions): Container;
  getResource(uri: LeafUri, options?: ResourceGetterOptions): Leaf;
  getResource(uri: string, options?: ResourceGetterOptions): Resource;
  getResource(uri: string, options?: ResourceGetterOptions): Resource {
    return this.context.resourceStore.get(uri, options);
  }
}
