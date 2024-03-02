import type { FunctionComponent } from "react";
import React, { useCallback } from "react";
import {
  BrowserSolidLdoProvider,
  useResource,
  useSolidAuth,
  useSubject,
} from "@ldo/solid-react";
import { SolidProfileShapeShapeType } from "./.ldo/solidProfile.shapeTypes";
import { changeData, commitData } from "@ldo/solid";

// The base component for the app
const App: FunctionComponent = () => {
  return (
    /* The application should be surrounded with the BrowserSolidLdoProvider
    this will set up all the underlying infrastructure for the application */
    <BrowserSolidLdoProvider>
      <Login />
    </BrowserSolidLdoProvider>
  );
};

// A component that handles login
const Login: FunctionComponent = () => {
  // Get login information using the "useSolidAuth" hook
  const { login, logout, session } = useSolidAuth();

  const onLogin = useCallback(() => {
    const issuer = prompt("What is your Solid IDP?");
    // Call the "login" function to initiate login
    if (issuer) login(issuer);
  }, []);

  // You can use session.isLoggedIn to check if the user is logged in
  if (session.isLoggedIn) {
    return (
      <div>
        {/* Get the user's webId from session.webId */}
        <p>Logged in as {session.webId}</p>
        {/* Use the logout function to log out */}
        <button onClick={logout}>Log Out</button>
        <Profile />
      </div>
    );
  }
  return <button onClick={onLogin}>Log In</button>;
};

const Profile: FunctionComponent = () => {
  const { session } = useSolidAuth();
  const resource = useResource(session.webId);
  const profile = useSubject(SolidProfileShapeShapeType, session.webId);

  const onNameChange = useCallback(async (e) => {
    // Ensure that the
    if (!profile || !resource) return;
    const cProfile = changeData(profile, resource);
    cProfile.name = e.target.value;
    await commitData(cProfile);
  }, []);

  return <input type="text" value={profile?.name} onChange={onNameChange} />;
};

export default App;
