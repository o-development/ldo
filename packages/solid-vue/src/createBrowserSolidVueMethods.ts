import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import type { SolidConnectedPlugin } from "@ldo/connected-solid";
import { provideSolidAuth, useSolidAuth } from "./useSolidAuth.js";

export function createBrowserSolidVueMethods(
  dataset: ConnectedLdoDataset<(SolidConnectedPlugin | ConnectedPlugin)[]>,
) {
  return {
    provideSolidAuth,
    useSolidAuth,
  };
}
