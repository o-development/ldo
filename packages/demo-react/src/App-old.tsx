import type { FunctionComponent } from "react";
import React from "react";
import { Router } from "./Layout";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";

const ProfileApp: FunctionComponent = () => {
  return (
    <BrowserSolidLdoProvider>
      <Router />
    </BrowserSolidLdoProvider>
  );
};
export default ProfileApp;
