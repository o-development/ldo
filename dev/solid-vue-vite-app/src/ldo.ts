import { createLdoVueComposables, createLdoVueMethods } from "@ldo/vue";
import { createBrowserSolidVueComposables } from "@ldo/solid-vue";
import { nextGraphConnectedPlugin } from "@ldo/connected-nextgraph";

export const {
  provideSolidLdo,
  useSubject,
  useResource,
  useMatchSubject,
  useSolidAuth,
} = createBrowserSolidVueComposables([nextGraphConnectedPlugin]);

createLdoVueMethods([nextGraphConnectedPlugin]);
createLdoVueComposables([nextGraphConnectedPlugin]);
