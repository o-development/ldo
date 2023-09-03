import { useSolidAuth } from "@ldo/solid-react";
import React, { useState } from "react";
import type { FunctionComponent } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./dashboard/Dashboard";
import { Media } from "./media/Media";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/media/:uri",
    element: <Media />,
  },
]);

const DEFAULT_ISSUER = "https://pod.lightover.com";

export const Layout: FunctionComponent = () => {
  const { login, logout, signUp, session, ranInitialAuthCheck } =
    useSolidAuth();
  const [issuer, setIssuer] = useState(DEFAULT_ISSUER);
  console.log(ranInitialAuthCheck);
  if (!ranInitialAuthCheck) {
    return <p>Loading</p>;
  }
  return (
    <div>
      <header
        style={{
          height: 50,
          borderBottom: "1px solid black",
          display: "flex",
          alignItems: "center",
          padding: 10,
        }}
      >
        {session.isLoggedIn ? (
          <>
            <p>Logged in as {session.webId}</p>
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
      {session.isLoggedIn ? <RouterProvider router={router} /> : undefined}
    </div>
  );
};
