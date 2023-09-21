import React from "react";
import type { FunctionComponent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MediaPost } from "./MediaPost";

export const MediaPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { uri } = useParams();

  return (
    <div>
      <button onClick={() => navigate("/")}>Back to Feed</button>
      {uri ? <MediaPost uri={uri} /> : <p>No URI Present</p>}
    </div>
  );
};
