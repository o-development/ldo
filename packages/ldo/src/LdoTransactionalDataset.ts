import type { TransactionalDataset } from "@ldo/subscribable-dataset";
import { LdoDataset } from "../dist/LdoDataset";
import type { Quad } from "@rdfjs/types";
import type { DatasetChanges } from "@ldo/rdf-utils";

export class LdoTransactionalDataset
  extends LdoDataset
  implements TransactionalDataset<Quad>
{
  constructor() {
    
  }

  rollback(): void {
    throw new Error("Method not implemented.");
  }
  commit(): void {
    throw new Error("Method not implemented.");
  }
  getChanges(): DatasetChanges<Quad> {
    throw new Error("Method not implemented.");
  }
}
