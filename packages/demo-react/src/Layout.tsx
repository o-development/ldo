import { useSolidAuth } from "@ldobjects/solid-react";
import React from "react";
import type { FunctionComponent } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Blog } from "./blog/Blog";
import { PostPage } from "./post/PostPage";
import { Header } from "./Header";
import { MainContainerProvider } from "./MainContainerProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Blog />,
  },
  {
    path: "/media/:uri",
    element: <PostPage />,
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
