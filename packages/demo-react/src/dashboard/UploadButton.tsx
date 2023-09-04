import React, { useCallback } from "react";
import type { FunctionComponent } from "react";

export const UploadButton: FunctionComponent = () => {
  const upload = useCallback(() => {
    const _message = prompt("Type a message for your post");
  }, []);

  return <button onClick={upload}>Make a New Post</button>;
};
