import { createLdoVueComposables } from "@ldo/vue";
import {
  provideSolidAuth,
  useSolidAuth,
  solidAuthInjectionKey,
} from "./useSolidAuth.js";
import { solidConnectedPlugin } from "@ldo/connected-solid";
import type { ConnectedPlugin } from "@ldo/connected";
import { createUseRootContainerFor } from "./useRootContainerFor.js";
import { createUseResourceWithAuth } from "./useResourceWithAuth.js";

export function createBrowserSolidVueComposables<
  Plugin extends ConnectedPlugin = never,
>(additionalPlugins: Plugin[] = []) {
  const {
    provideDataset,
    useResource,
    useDataset,
    datasetInjectionKey,
    ...vueComposables
  } = createLdoVueComposables([solidConnectedPlugin, ...additionalPlugins]);

  function provideSolidLdo() {
    const dataset = provideDataset();
    const solidAuth = provideSolidAuth();
    dataset.setContext("solid", { fetch: solidAuth.fetch });
    return { dataset, solidAuth };
  }

  const useResourceWithAuth = createUseResourceWithAuth({
    useResource,
    useSolidAuth,
  });

  return {
    solidAuthInjectionKey,
    datasetInjectionKey,
    provideSolidLdo,
    provideDataset,
    useResource: useResourceWithAuth,
    useDataset,
    ...vueComposables,
    provideSolidAuth,
    useSolidAuth,
    useRootContainerFor: createUseRootContainerFor({
      useSolidAuth,
      useDataset,
      useResource: useResourceWithAuth,
    }),
  };
}
