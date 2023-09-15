import React, { useState, useEffect } from "react";
import type { FunctionComponent } from "react";
import type { Container, LeafUri } from "@ldo/solid";
import { useSolidAuth, useLdo } from "@ldo/solid-react";

export interface BuildRootContainerChildProps {
  rootContainer: Container;
}

export const BuildRootContainer: FunctionComponent<{
  child: FunctionComponent<BuildRootContainerChildProps>;
}> = ({ child }) => {
  const Child = child;
  const [rootContainer, setRootContainer] = useState<Container | undefined>();
  const { session } = useSolidAuth();
  const { getResource } = useLdo();

  useEffect(() => {
    if (session.webId) {
      const webIdResource = getResource(session.webId as LeafUri);
      webIdResource.getRootContainer().then((rootContainer) => {
        if (rootContainer.type !== "error") {
          setRootContainer(rootContainer);
        } else {
          alert(rootContainer.message);
        }
      });
    }
  }, [session.webId]);

  if (!session.webId || !rootContainer) {
    // Return blank screen
    return <p>Loading</p>;
  }

  return <Child rootContainer={rootContainer} />;
};
