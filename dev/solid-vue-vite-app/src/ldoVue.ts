import { createLdoVueMethods } from "@ldo/vue";
import { solidConnectedPlugin } from "@ldo/connected-solid";

export const { dataset, useSubject, useResource } = createLdoVueMethods([
  solidConnectedPlugin,
]);
