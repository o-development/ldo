import {
  isSolidUri,
  type SolidConnectedPlugin,
  type SolidContainer,
  type SolidLeaf,
} from "@ldo/connected-solid";
import type { useResourceType } from "@ldo/vue";
import { toValue, watch } from "vue";
import type { useSolidAuth } from "./useSolidAuth.js";

type UseSolidAuth = typeof useSolidAuth;

/**
 * If the uri is Solid uri, we want refetch the resource when session.isActive changes
 */
export function createUseResourceWithAuth({
  useResource,
  useSolidAuth,
}: {
  useResource: useResourceType<SolidConnectedPlugin[]>;
  useSolidAuth: UseSolidAuth;
}): useResourceType<SolidConnectedPlugin[]> {
  return function useResourceWithAuth(
    uri: Parameters<typeof useResource>[0],
    options?: Parameters<typeof useResource>[1],
  ) {
    const resourceRef = useResource(uri, options);
    const solidAuth = useSolidAuth();
    watch([() => solidAuth.session.value.isActive], async ([isActive]) => {
      void isActive;
      const uriValue = toValue(uri);
      const { suppressInitialRead } = toValue(options) ?? {};
      if (uriValue && isSolidUri(uriValue)) {
        const resource = resourceRef.value as SolidLeaf | SolidContainer;
        // if the read has not been initialized and initial read is suppressed, don't re-read
        if (
          !(
            suppressInitialRead &&
            resource.status.type === "unfetched" &&
            !resource.isLoading()
          )
        ) {
          console.log("REFETCHING");
          await resourceRef.value!.read();
        }
      }
    });
    return resourceRef;
  };
}
