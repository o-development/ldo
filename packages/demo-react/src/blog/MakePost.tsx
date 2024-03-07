import React, { useCallback, useState, useRef } from "react";
import type { FunctionComponent, FormEvent } from "react";
import type { Container, Leaf, LeafUri } from "@ldo/solid";
import { v4 } from "uuid";
import { useLdo, useSolidAuth } from "@ldo/solid-react";
import { PostShShapeType } from "../.ldo/post.shapeTypes";

export const MakePost: FunctionComponent<{ mainContainer: Container }> = ({
  mainContainer,
}) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { createData, commitData } = useLdo();
  const { session } = useSolidAuth();
  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Create the container file
      const mediaContainerResult = await mainContainer.createChildAndOverwrite(
        `${v4()}/`,
      );
      if (mediaContainerResult.isError) {
        alert(mediaContainerResult.message);
        return;
      }
      const mediaContainer = mediaContainerResult.resource;

      // Upload Image
      let uploadedImage: Leaf | undefined;
      if (selectedFile) {
        const result = await mediaContainer.uploadChildAndOverwrite(
          selectedFile.name as LeafUri,
          selectedFile,
          selectedFile.type,
        );
        if (result.isError) {
          alert(result.message);
          await mediaContainer.delete();
          return;
        }
        uploadedImage = result.resource;
      }

      // Create Post
      const indexResource = mediaContainer.child("index.ttl");
      const post = createData(
        PostShShapeType,
        indexResource.uri,
        indexResource,
      );
      post.articleBody = message;
      if (uploadedImage) {
        post.image = { "@id": uploadedImage.uri };
      }
      if (session.webId) {
        post.publisher = { "@id": session.webId };
      }
      post.type = { "@id": "SocialMediaPosting" };
      post.uploadDate = new Date().toISOString();
      const result = await commitData(post);
      if (result.isError) {
        alert(result.message);
      }

      // Clear the UI after Upload
      setMessage("");
      setSelectedFile(undefined);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [message, selectedFile, session.webId],
  );

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Make a Post"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => setSelectedFile(e.target.files?.[0])}
      />
      <input type="submit" value="Post" />
    </form>
  );
};
