import type { Dataset, DatasetFactory } from "@rdfjs/types";
import { SolidLdoDataset } from "./SolidLdoDataset";
import { AccessRulesStore } from "./document/accessRules/AccessRulesStore";
import { BinaryResourceStore } from "./document/resource/binaryResource/BinaryResourceStore";
import { DataResourceStore } from "./document/resource/dataResource/DataResourceStore";
import { ContainerResourceStore } from "./document/resource/dataResource/containerResource/ContainerResourceStore";
import type {
  DocumentEventEmitter,
  SolidLdoDatasetContext,
} from "./SolidLdoDatasetContext";
import crossFetch from "cross-fetch";
import { EventEmitter } from "events";
import { createDataset, createDatasetFactory } from "@ldo/dataset";

export interface CreateSolidLdoDatasetOptions {
  fetch?: typeof fetch;
  dataset?: Dataset;
  datasetFactory?: DatasetFactory;
}

export function createSolidLdoDataset(
  options?: CreateSolidLdoDatasetOptions,
): SolidLdoDataset {
  const finalFetch = options?.fetch || crossFetch;
  const finalDatasetFactory = options?.datasetFactory || createDatasetFactory();
  const finalDataset = options?.dataset || createDataset();

  // Ignoring because of circular dependency
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const context: SolidLdoDatasetContext = {
    documentEventEmitter: new EventEmitter() as DocumentEventEmitter,
    fetch: finalFetch,
  };
  const binaryResourceStore = new BinaryResourceStore(context);
  const dataResourceStore = new DataResourceStore(context);
  const containerResourceStore = new ContainerResourceStore(context);
  const accessRulesStore = new AccessRulesStore(context);
  const solidLdoDataset = new SolidLdoDataset(
    context,
    finalDatasetFactory,
    finalDataset,
  );
  context.binaryResourceStore = binaryResourceStore;
  context.dataResourceStore = dataResourceStore;
  context.containerResourceStore = containerResourceStore;
  context.accessRulesStore = accessRulesStore;
  context.solidLdoDataset = solidLdoDataset;

  return solidLdoDataset;
}
