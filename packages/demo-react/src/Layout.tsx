import { useSolidAuth } from "@ldo/solid-react";
import React, { useState } from "react";
import type { FunctionComponent } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./dashboard/Dashboard";
import { Media } from "./media/Media";
import { BuildRootContainer } from "./dashboard/BuildRootContainer";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BuildRootContainer child={Dashboard} />,
  },
  {
    path: "/media/:uri",
    element: <Media />,
  },
]);

const DEFAULT_ISSUER = "https://solidweb.me";

export const Layout: FunctionComponent = () => {
  const { login, logout, signUp, session, ranInitialAuthCheck } =
    useSolidAuth();
  const [issuer, setIssuer] = useState(DEFAULT_ISSUER);
  if (!ranInitialAuthCheck) {
    return <p>Loading</p>;
  }
  return (
    <div>
      <header style={{ display: "flex" }}>
        {session.isLoggedIn ? (
          <>
            <span>Logged in as {session.webId}</span>
            <button onClick={logout}>Log Out</button>
          </>
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
      <hr />
      {session.isLoggedIn ? <RouterProvider router={router} /> : undefined}
    </div>
  );
};
