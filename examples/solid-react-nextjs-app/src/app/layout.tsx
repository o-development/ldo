import type { Metadata } from "next";
import "./globals.css";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";
import { ReactNode } from "react";

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
        {/* @ts-expect-error React types dependency mismatch (TODO fix) */}
        <BrowserSolidLdoProvider>{children}</BrowserSolidLdoProvider>
      </body>
    </html>
  );
}
