import React, { useState, useEffect } from "react";
import type { FunctionComponent } from "react";
import type { Container, ContainerUri, LeafUri } from "@ldo/solid";
import { useSolidAuth, useLdo } from "@ldo/solid-react";

export interface BuildMainContainerChildProps {
  mainContainerUri: ContainerUri;
}

export const BuildMainContainer: FunctionComponent<{
  child: FunctionComponent<BuildMainContainerChildProps>;
}> = ({ child }) => {
  const Child = child;
  const [mainContainer, setMainContainer] = useState<Container | undefined>();
  const { session } = useSolidAuth();
  const { getResource } = useLdo();

  useEffect(() => {
    if (session.webId) {
      const webIdResource = getResource(session.webId as LeafUri);
      webIdResource.getRootContainer().then(async (rootContainer) => {
        if (rootContainer.type === "error") {
          alert(rootContainer.message);
          return;
        }
        const mainContainer = getResource(`${rootContainer.uri}demo-react/`);
        setMainContainer(mainContainer);
        await mainContainer.read();
        if (mainContainer.isAbsent()) {
          await mainContainer.createIfAbsent();
          await mainContainer.setAccessRules({
            public: {
              read: true,
              write: false,
              append: false,
              control: false,
            },
            agent: {
              [session.webId!]: {
                read: true,
                write: true,
                append: true,
                control: true,
              },
            },
          });
        }
      });
    }
  }, [session.webId]);

  if (!session.webId || !mainContainer) {
    // Return blank screen
    return <p>Loading</p>;
  }

  return <Child mainContainerUri={mainContainer.uri} />;
};
