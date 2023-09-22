import { useSolidAuth } from "@ldobjects/solid-react";
import React from "react";
import type { FunctionComponent } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./dashboard/Dashboard";
import { MediaPage } from "./media/MediaPage";
import { Header } from "./Header";
import { MainContainerProvider } from "./MainContainerProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
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
      <MainContainerProvider>
        {session.isLoggedIn ? <RouterProvider router={router} /> : undefined}
      </MainContainerProvider>
    </div>
  );
};
