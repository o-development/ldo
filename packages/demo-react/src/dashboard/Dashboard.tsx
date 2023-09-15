import React from "react";
import type { FunctionComponent } from "react";
import type { BuildRootContainerChildProps } from "./BuildRootContainer";

export const Dashboard: FunctionComponent<BuildRootContainerChildProps> = ({
  rootContainer,
}) => {
  return <p>{rootContainer.uri}</p>;
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
