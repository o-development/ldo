import type { nodeEventListener } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";
import { TrackingDataset } from "./TrackingDataset.js";
import type { ILdoDataset } from "@ldo/ldo";

export function createTrackingDataset<D extends ILdoDataset>(
  dataset: D,
  listener: nodeEventListener<Quad>,
) {
  const tracker = new TrackingDataset(dataset, listener);

  return tracker;
}

export type TrackingDataset_<D> = D & { dispose(): void };
