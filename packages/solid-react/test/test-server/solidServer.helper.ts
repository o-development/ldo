// Taken from https://github.com/comunica/comunica/blob/b237be4265c353a62a876187d9e21e3bc05123a3/engines/query-sparql/test/QuerySparql-solid-test.ts#L9

import * as path from "path";
import type { App } from "@solid/community-server";
import { AppRunner, resolveModulePath } from "@solid/community-server";

export async function createApp(): Promise<App> {
  if (process.env.SERVER) {
    return {
      start: () => {},
      stop: () => {},
    } as App;
  }
  const appRunner = new AppRunner();
  return appRunner.create(
    {
      mainModulePath: resolveModulePath(""),
      typeChecking: false,
    },
    path.join(
      __dirname,
      "configs",
      "components-config",
      "unauthenticatedServer.json",
    ),
    {},
    {
      port: 3_001,
      loggingLevel: "off",
      seededPodConfigJson: path.join(
        __dirname,
        "configs",
        "solid-css-seed.json",
      ),
    },
  );
}

export interface ISecretData {
  id: string;
  secret: string;
}
