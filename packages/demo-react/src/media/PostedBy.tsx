import type { FunctionComponent } from "react";
import React from "react";
import { useResource, useSubject } from "@ldobjects/solid-react";
import { SolidProfileShapeShapeType } from "../.ldo/solidProfile.shapeTypes";

export const PostedBy: FunctionComponent<{ webId: string }> = ({ webId }) => {
  const webIdResource = useResource(webId);
  const profile = useSubject(SolidProfileShapeShapeType, webId);

  if (webIdResource.isReading()) {
    return <p>Loading Profile...</p>;
  } else if (webIdResource.status.isError) {
    return <p>Error: {webIdResource.status.message}</p>;
  }
  return <p>Posted By: {profile.fn}</p>;
};
