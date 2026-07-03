import type { Metadata } from "next";
import "./globals.css";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Solid React Nextjs Example",
  description: "Next.js example app with @ldo/solid-react",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BrowserSolidLdoProvider>{children}</BrowserSolidLdoProvider>
      </body>
    </html>
  );
}
