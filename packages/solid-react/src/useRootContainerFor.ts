import { useEffect, useState } from "react";
import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import type {
  SolidConnectedPlugin,
  SolidContainer,
  SolidContainerUri,
  SolidLeafUri,
} from "@ldo/connected-solid";
import type { UseResourceOptions, createUseResource } from "@ldo/react";

export function createUseRootContainerFor(
  dataset: ConnectedLdoDataset<SolidConnectedPlugin[]>,
  useResource: ReturnType<typeof createUseResource<ConnectedPlugin[]>>,
) {
  return function useRootContainerFor(
    uri?: SolidContainerUri | SolidLeafUri,
    options?: UseResourceOptions<"solid">,
  ): SolidContainer | undefined {
    const [rootContainerUri, setRootContainerUri] = useState<
      SolidContainerUri | undefined
    >(undefined);

    useEffect(() => {
      if (uri) {
        const givenResource = dataset.getResource(uri);
        givenResource.getRootContainer().then((result) => {
          if (!result.isError) {
            setRootContainerUri(result.uri);
          }
        });
      } else {
        setRootContainerUri(undefined);
      }
    }, [uri]);

    return useResource(rootContainerUri, options) as SolidContainer | undefined;
  };
}
