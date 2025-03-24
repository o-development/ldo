import type { Container, ContainerUri } from "@ldo/solid";
import { useEffect, useState } from "react";
import type { UseResourceOptions } from "./useResource";
import { useResource } from "./useResource";
import { useLdo } from "./SolidLdoProvider";

export function useRootContainerFor(
  uri?: string,
  options?: UseResourceOptions,
): Container | undefined {
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
    } else {
      setRootContainerUri(undefined);
    }
  }, [uri]);

  return useResource(rootContainerUri, options);
}
