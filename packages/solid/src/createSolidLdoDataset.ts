import type { Dataset } from "@ldo/rdf-utils";
import type { SolidLdoDataset } from "./SolidLdoDataset";
import { AccessRulesStore } from "./document/accessRules/AccessRulesStore";
import { BinaryResourceStore } from "./document/resource/binaryResource/BinaryResourceStore";
import { DataResourceStore } from "./document/resource/dataResource/DataResourceStore";
import { ContainerResourceStore } from "./document/resource/dataResource/containerResource/ContainerResourceStore";

export interface CreateSolidLdoDatasetOptions {
  fetch?: typeof fetch;
  dataset?: Dataset;
}

export function createSolidLdoDataset(
  options?: CreateSolidLdoDatasetOptions,
): SolidLdoDataset {
  const finalFetch = fetch ||  vbhyg

  // Ingnoring this because we're setting up circular dependencies
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const dependencies: LdoContextData = {
    onDocumentError,
    fetch: finalFetch,
    dataset: ldoDataset,
    updateManager: new UpdateManager(),
  };
  const binaryResourceStore = new BinaryResourceStore(dependencies);
  const dataResourceStore = new DataResourceStore(dependencies);
  const containerResourceStore = new ContainerResourceStore(dependencies);
  const accessRulesStore = new AccessRulesStore(dependencies);
}
