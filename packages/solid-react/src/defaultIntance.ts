import { solidConnectedPlugin } from "@ldo/connected-solid";
import { createLdoReactMethods } from "@ldo/react";
import { createBrowserSolidLdoProvider } from "./BrowserSolidLdoProvider";

export const {
  dataset,
  useLdo,
  useMatchObject,
  useMatchSubject,
  useResource,
  useSubject,
  useSubscribeToResource,
} = createLdoReactMethods([solidConnectedPlugin]);

export const BrowserSolidLdoProvider = createBrowserSolidLdoProvider(dataset);
