/* eslint-disable @typescript-eslint/no-explicit-any */
import { createUseLdo } from "./methods/useLdo";
import {
  createConnectedLdoDataset,
  type ConnectedPlugin,
} from "@ldo/connected";
import { createUseMatchObject } from "./methods/useMatchObject";
import { createUseMatchSubject } from "./methods/useMatchSubject";
import { createUseResource } from "./methods/useResource";
import { createUseSubject } from "./methods/useSubject";
import { createUseSubscribeToResource } from "./methods/useSubscribeToResource";

export function createLdoReactMethods<
  Plugins extends ConnectedPlugin<any, any, any, any>[],
>(plugins: Plugins) {
  const dataset = createConnectedLdoDataset(plugins);
  dataset.setMaxListeners(1000);

  return {
    dataset,
    useLdo: createUseLdo(dataset),
    useMatchObject: createUseMatchObject(dataset),
    useMatchSubject: createUseMatchSubject(dataset),
    useResource: createUseResource(dataset),
    useSubject: createUseSubject(dataset),
    useSubscribeToResource: createUseSubscribeToResource(dataset),
  };
}
