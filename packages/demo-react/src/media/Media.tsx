import React from "react";
import type { FunctionComponent } from "react";
import { useParams } from "react-router-dom";

export const Media: FunctionComponent = () => {
  const { uri } = useParams();
  return (
    <div>
      <p>Media: {uri}</p>
    </div>
  );
};
