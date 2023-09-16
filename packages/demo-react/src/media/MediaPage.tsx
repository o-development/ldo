import React from "react";
import type { FunctionComponent } from "react";
import { useParams } from "react-router-dom";
import { MediaPost } from "./MediaPost";

export const MediaPage: FunctionComponent = () => {
  const { uri } = useParams();
  if (!uri) {
    return <p>No URI present</p>;
  }
  return <MediaPost uri={uri} />;
};
