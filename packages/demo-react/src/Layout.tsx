import { useSolidAuth } from "@ldo/solid-react";
import React from "react";
import type { FunctionComponent } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./dashboard/Dashboard";
import { BuildMainContainer } from "./dashboard/BuildMainContainer";
import { MediaPage } from "./media/MediaPage";
import { Header } from "./Header";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BuildMainContainer child={Dashboard} />,
  },
  {
    path: "/media/:uri",
    element: <MediaPage />,
  },
]);

export const Layout: FunctionComponent = () => {
  const { session, ranInitialAuthCheck } = useSolidAuth();
  if (!ranInitialAuthCheck) {
    return <p>Loading</p>;
  }
  return (
    <div>
      <Header />
      <hr />
      {session.isLoggedIn ? <RouterProvider router={router} /> : undefined}
    </div>
  );
};
