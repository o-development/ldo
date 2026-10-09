import { solidConnectedPlugin } from "@ldo/connected-solid";
import { createLdoVueMethods } from "@ldo/vue";
import { createBrowserSolidVueMethods } from "./createBrowserSolidVueMethods";

export const {
  dataset,
  useDataset,
  useLdo,
  useResource,
  useSubject,
  useMatchObject,
  useMatchSubject,
  useSubscribeToResource,
  useLinkQuery,
  useChangeDataset,
  useChangeSubject,
  useChangeMatchObject,
  useChangeMatchSubject,
} = createLdoVueMethods([solidConnectedPlugin]);

export const { useSolidAuth, provideSolidAuth } =
  createBrowserSolidVueMethods(dataset);
