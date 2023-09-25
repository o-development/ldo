import React, { Fragment, useContext } from "react";
import type { FunctionComponent } from "react";
import { MainContainerContext } from "../MainContainerProvider";
import { Post } from "../post/Post";
import { MakePost } from "./MakePost";

export const Blog: FunctionComponent = () => {
  const mainContainer = useContext(MainContainerContext);
  if (mainContainer === undefined) {
    return <p>Loading...</p>;
  }
  if (mainContainer.isDoingInitialFetch()) {
    return <p>Loading Blob</p>;
  }

  return (
    <div>
      <div>
        <MakePost mainContainer={mainContainer} />
      </div>
      <hr />
      {mainContainer.children().map((child) => (
        <Fragment key={child.uri}>
          <Post uri={child.uri} />
          <hr />
        </Fragment>
      ))}
    </div>
  );
};
