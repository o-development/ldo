import { createLdoVueComposables } from "@ldo/vue";
import {
  provideSolidAuth,
  useSolidAuth,
  solidAuthInjectionKey,
} from "./useSolidAuth";
import { solidConnectedPlugin } from "@ldo/connected-solid";
import type { ConnectedPlugin } from "@ldo/connected";
import { createUseRootContainerFor } from "./useRootContainerFor";
import { createUseResourceWithAuth } from "./useResourceWithAuth";

/**
 * Create LDO Vue composables with Solid protocol support.
 *
 * You can optionally also provide an array of additional plugins.
 * Solid connected plugin is included by default.
 */
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
    // Bind the Solid session's authenticate fetch to the LDO dataset
    // to send Solid-authenticated requests.
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
