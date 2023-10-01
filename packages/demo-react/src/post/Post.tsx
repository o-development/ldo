import React, { useCallback } from "react";
import type { FunctionComponent } from "react";
import { useLdo, useResource, useSubject } from "@ldo/solid-react";
import { PostShShapeType } from "../.ldo/post.shapeTypes";
import { useNavigate } from "react-router-dom";
import { PostedBy } from "./PostedBy";

export const Post: FunctionComponent<{ uri: string }> = ({ uri }) => {
  const navigate = useNavigate();
  const mediaResource = useResource(`${uri}index.ttl`);
  const post = useSubject(PostShShapeType, mediaResource.uri);
  const { getResource } = useLdo();
  const deletePost = useCallback(async () => {
    const postContainer = getResource(uri);
    const result = await postContainer.delete();
    if (result.isError) {
      alert(result.message);
    }
  }, [uri]);

  if (mediaResource.isReading()) {
    return <p>Loading Post...</p>;
  } else if (mediaResource.status.isError) {
    return <p>Error: {mediaResource.status.message}</p>;
  } else if (mediaResource.isAbsent()) {
    return <p>Post does not exist.</p>;
  }

  return (
    <div>
      {post.publisher?.["@id"] && <PostedBy webId={post.publisher["@id"]} />}
      <div
        onClick={() => navigate(`/media/${encodeURIComponent(uri)}`)}
        style={{ cursor: "pointer" }}
      >
        {post.articleBody && <p>{post.articleBody}</p>}
        {post.image && <img src={post.image["@id"]} style={{ height: 300 }} />}
      </div>
      <button onClick={deletePost}>Delete Post</button>
    </div>
  );
};
