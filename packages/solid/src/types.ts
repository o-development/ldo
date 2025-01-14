import type { ILdoDataset } from "@ldo/ldo";
import type { ResourceGetterOptions } from "./ResourceStore";
import type { Container } from "./resource/Container";
import type { Leaf } from "./resource/Leaf";
import type { ContainerUri, LeafUri } from "./util/uriTypes";
import type { SolidLdoTransactionDataset } from "./SolidLdoTransactionDataset";

/**
 * A SolidLdoDataset provides methods for getting Solid resources.
 */
export interface ISolidLdoDataset extends ILdoDataset {
  startTransaction(): SolidLdoTransactionDataset;

  getResource(uri: ContainerUri, options?: ResourceGetterOptions): Container;
  getResource(uri: LeafUri, options?: ResourceGetterOptions): Leaf;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container;
}
