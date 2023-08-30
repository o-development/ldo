import React, { FunctionComponent } from "react";
import Profile from "./Profile";
import { SolidAuthProvider, LdoProvider } from "@ldo/solid-react";
import { fetch } from "solid-authn-react-native";
import Layout from "./Layout";

const ProfileApp: FunctionComponent = () => {
  return (
    <SolidAuthProvider>
      <LdoProvider fetch={fetch}>
        <Layout>
          <Profile />
        </Layout>
      </LdoProvider>
    </SolidAuthProvider>
  );
};
export default ProfileApp;
