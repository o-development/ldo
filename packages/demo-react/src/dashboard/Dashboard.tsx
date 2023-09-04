import React, { useCallback, useEffect, useMemo } from "react";
import type { FunctionComponent } from "react";
import { UploadButton } from "./UploadButton";
import { useContainerResource, useDataResource, useSolidAuth } from "@ldo/solid-react";
import { AccessRules, ContainerResource } from "@ldo/solid";

export const Dashboard: FunctionComponent = () => {
  const { session } = useSolidAuth();

  const containerUri = useMemo(() => {
    if (!session.webId) return "";
    // HACK: this is a hard coded hack to find the root container. Solid doesn't
    // have an official way of doing this.
    const rootContainer = session.webId.replace("profile/card#me", "");
    return `${rootContainer}demo-ldo/`;
  }, [session.webId]);

  const mainContainer = useDataResource(containerUri);


  if (mainContainer instanceof AccessRules) {
    console.log("here");
  }

  useEffect(() => {
    // Upon load check to see if the root folder exists
    mainContainer.checkExists().then(async (doesExist) => {
      console.log(doesExist);


      const error: DocumentError = await mainContainer.create();
      if (error) {
        // hanldle
        return;
      }

      // // If not, create it
      // if (!doesExist) {
      //   await mainContainer.create();
      //   const accessRules = mainContainer.accessRules;
      // }
    });
  }, [mainContainer]);

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
