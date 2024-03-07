import { useSolidAuth } from "@ldo/solid-react";
import React, { Fragment } from "react";
import type { FunctionComponent } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Blog } from "./blog/Blog";
import { PostPage } from "./post/PostPage";
import { Header } from "./Header";
import { MainContainerProvider } from "./MainContainerProvider";
import { Profile } from "./profile/Profile";

export const Layout: FunctionComponent = () => {
  const { session } = useSolidAuth();
  return (
    <div>
      <Header />
      <hr />
      <MainContainerProvider>
        {session.isLoggedIn ? <Outlet /> : <Fragment />}
      </MainContainerProvider>
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Blog />,
      },
      {
        path: "/media/:uri",
        element: <PostPage />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
]);

export const Router: FunctionComponent = () => {
  const { ranInitialAuthCheck } = useSolidAuth();
  if (!ranInitialAuthCheck) {
    return <p>Loading</p>;
  }
  return <RouterProvider router={router} />;
};
