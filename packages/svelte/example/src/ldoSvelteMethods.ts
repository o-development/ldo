import { createLdoSvelteMethods } from "@ldo/svelte";
import { solidConnectedPlugin } from "@ldo/connected-solid";

export const {
  dataset,
  useLdo,
  useMatchObject,
  useMatchSubject,
  useResource,
  useSubject,
  useSubscribeToResource,
  useLinkQuery,
} = createLdoSvelteMethods([solidConnectedPlugin]);
