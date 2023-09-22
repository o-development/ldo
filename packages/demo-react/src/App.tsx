import type { FunctionComponent } from "react";
import React from "react";
import { Layout } from "./Layout";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";

const ProfileApp: FunctionComponent = () => {
  return (
    <BrowserSolidLdoProvider>
      <Layout />
    </BrowserSolidLdoProvider>
  );
};
export default ProfileApp;
