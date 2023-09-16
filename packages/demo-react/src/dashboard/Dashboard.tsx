import React from "react";
import type { FunctionComponent } from "react";
import type { BuildMainContainerChildProps } from "./BuildMainContainer";
import { useResource } from "@ldo/solid-react";
import { MediaPost } from "../media/MediaPost";
import { UploadButton } from "./UploadButton";

export const Dashboard: FunctionComponent<BuildMainContainerChildProps> = ({
  mainContainerUri,
}) => {
  const mainContainer = useResource(mainContainerUri);
  if (mainContainer.isLoading()) {
    return <p>Loading Main Container</p>;
  }

  return (
    <div>
      <div>
        <UploadButton />
      </div>
      <hr />
      {mainContainer.children().map((child) => (
        <MediaPost key={child.uri} uri={child.uri} />
      ))}
    </div>
  );
};
