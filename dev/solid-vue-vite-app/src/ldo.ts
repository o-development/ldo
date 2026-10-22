import { createBrowserSolidVueComposables } from "@ldo/solid-vue";
import { nextGraphConnectedPlugin } from "@ldo/connected-nextgraph";

export const {
  provideSolidLdo,
  useSubject,
  useResource,
  useMatchSubject,
  useSolidAuth,
  useRootContainerFor,
} = createBrowserSolidVueComposables([nextGraphConnectedPlugin]);
