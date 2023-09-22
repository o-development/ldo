import React, { Fragment, useContext } from "react";
import type { FunctionComponent } from "react";
import { MainContainerContext } from "../MainContainerProvider";
import { MediaPost } from "../media/MediaPost";
import { UploadButton } from "./UploadButton";

export const Dashboard: FunctionComponent = () => {
  const mainContainer = useContext(MainContainerContext);
  if (mainContainer === undefined) {
    return <p>Loading...</p>;
  }
  if (mainContainer.isDoingInitialFetch()) {
    return <p>Loading Main Container</p>;
  }

  return (
    <div>
      <div>
        <UploadButton mainContainer={mainContainer} />
      </div>
      <hr />
      {mainContainer.children().map((child) => (
        <Fragment key={child.uri}>
          <MediaPost uri={child.uri} />
          <hr />
        </Fragment>
      ))}
    </div>
  );
};
