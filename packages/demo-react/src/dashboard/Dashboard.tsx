import React, { useCallback, useEffect, useMemo } from "react";
import type { FunctionComponent } from "react";
import { UploadButton } from "./UploadButton";
import { useContainerResource, useDataResource, useSolidAuth } from "@ldo/solid-react";
import { AccessRules, ContainerResource } from "@ldo/solid";

export const Dashboard: FunctionComponent = () => {
  const { session } = useSolidAuth();

  const rootContainer = useRootContainer(session.webId);
  const mainContainer = useContainerResource()
  // useParentContainer

  useEffect(() => {
    if (rootContainer) {

    }
  }, [rootContainer]);

  return (
    <div>
      <div>
        <UploadButton />
      </div>
      <hr />
      <div>{mainContainer.isLoading ? "Loading" : "Not Loading"}</div>
    </div>
  );
};
