import React from "react";
import type { FunctionComponent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Post } from "./Post";

export const PostPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { uri } = useParams();

  return (
    <div>
      <button onClick={() => navigate("/")}>Back to Feed</button>
      {uri ? <Post uri={uri} /> : <p>No URI Present</p>}
    </div>
  );
};
