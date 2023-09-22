import type { FunctionComponent } from "react";
import React from "react";
import { Layout } from "./Layout";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";
import { MainContainerProvider } from "./MainContainerProvider";

const ProfileApp: FunctionComponent = () => {
  return (
    <BrowserSolidLdoProvider>
      <MainContainerProvider>
        <Layout />
      </MainContainerProvider>
    </BrowserSolidLdoProvider>
  );
};
export default ProfileApp;
