import { useState } from "react";
import type { FunctionComponent } from "react";
import React from "react";
import { useResource, useSolidAuth, useSubject } from "@ldo/solid-react";
import { SolidProfileShapeShapeType } from "./.ldo/solidProfile.shapeTypes";

const DEFAULT_ISSUER = "https://solidweb.me";

export const LoggedInHeader: FunctionComponent<{ webId: string }> = ({
  webId,
}) => {
  const webIdResource = useResource(webId);
  const profile = useSubject(SolidProfileShapeShapeType, webId);
  const { logout } = useSolidAuth();
  return (
    <>
      <span>
        Logged in as {webId}. Welcome{" "}
        {webIdResource.isReading() ? "LOADING NAME" : profile.fn}
      </span>
      <button onClick={logout}>Log Out</button>
    </>
  );
};

export const Header: FunctionComponent = () => {
  const [issuer, setIssuer] = useState(DEFAULT_ISSUER);
  const { login, signUp, session } = useSolidAuth();
  return (
    <header style={{ display: "flex" }}>
      {session.isLoggedIn ? (
        <LoggedInHeader webId={session.webId!} />
      ) : (
        <>
          <input
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
          />
          <button onClick={() => login(issuer)}>Log In</button>
          <button onClick={() => signUp(issuer)}>Sign Up</button>
        </>
      )}
    </header>
  );
};
