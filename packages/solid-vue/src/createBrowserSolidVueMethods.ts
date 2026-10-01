import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import type { SolidConnectedPlugin } from "@ldo/connected-solid";

export function createBrowserSolidVueMethods(
  dataset: ConnectedLdoDataset<(SolidConnectedPlugin | ConnectedPlugin)[]>,
) {
  return {
    useSolidAuth: undefined,
  };
}
