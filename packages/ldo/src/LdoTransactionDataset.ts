import { TransactionDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";
import type { ITermWrapperConstructor, TermWrapper } from "@rdfjs/wrapper";
import type { ILdoDataset } from "./types";
import { LdoBuilder } from "./LdoBuilder";
import { dataFactory } from "./dataFactory";

export class LdoTransactionDataset
  extends TransactionDataset<Quad>
  implements ILdoDataset
{
  usingType<Type extends TermWrapper>(
    termWrapperClass: ITermWrapperConstructor<Type>,
  ): LdoBuilder<Type> {
    return new LdoBuilder(termWrapperClass, this, dataFactory);
  }
}
