import React from "react";
import type { FunctionComponent } from "react";

export const MediaPost: FunctionComponent<{ uri: string }> = ({ uri }) => {
  return (
    <div>
      <p>Media: {uri}</p>
      <hr />
    </div>
  );
};
