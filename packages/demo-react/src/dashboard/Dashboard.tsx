import React from "react";
import type { FunctionComponent } from "react";
import type { BuildMainContainerChildProps } from "./BuildMainContainer";

export const Dashboard: FunctionComponent<BuildMainContainerChildProps> = ({
  mainContainer,
}) => {
  return <p>{mainContainer.uri}</p>;
  // return (
  //   <div>
  //     <div>
  //       <UploadButton />
  //     </div>
  //     <hr />
  //     <div>{mainContainer.isLoading ? "Loading" : "Not Loading"}</div>
  //   </div>
  // );
};
