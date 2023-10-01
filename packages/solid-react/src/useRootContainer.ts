import type { Container, ContainerUri } from "@ldo/solid";
import { useEffect, useState } from "react";
import { useResource } from "./useResource";
import { useLdo } from "./SolidLdoProvider";
export function useRootContainerFor(uri?: string): Container | undefined {
  const { getResource } = useLdo();

  const [rootContainerUri, setRootContainerUri] = useState<
    ContainerUri | undefined
  >(undefined);

  useEffect(() => {
    if (uri) {
      const givenResource = getResource(uri);
      givenResource.getRootContainer().then((result) => {
        if (!result.isError) {
          setRootContainerUri(result.uri);
        }
      });
    }
  }, [uri]);

  return useResource(rootContainerUri);
}
