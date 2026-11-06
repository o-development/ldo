import fs from "node:fs/promises";
import path from "path";
import { generateFromShacl } from "@jeswr/shacl2object/dist/generator/index.js";
import loading from "loading-cli";

interface BuildOptions {
  input: string;
  output: string;
}

async function exists(filename: string) {
  try {
    await fs.stat(filename);
    return true;
  } catch (e) {
    if (e instanceof Error && (e as NodeJS.ErrnoException).code === "ENOENT")
      return false;

    throw e;
  }
}

export async function build(options: BuildOptions) {
  const load = loading("Preparing Environment");
  load.start();

  if (await exists(options.output)) {
    await fs.rm(options.output, { recursive: true });
  }
  await fs.mkdir(options.output);

  load.text = "Generating LDO Documents";
  const inputEntries = await fs.readdir(options.input, {
    withFileTypes: true,
  });

  for (const entry of inputEntries) {
    if (!entry.isFile()) continue;

    await generateFromShacl(
      path.join(options.input, entry.name),
      path.join(options.output, entry.name),
      {
        classPrefix: "",
      },
    );
  }

  const outputEntries = await fs.readdir(options.output, {
    withFileTypes: true,
  });
  const indexContents = outputEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => entry.name)
    .filter((fileName) => fileName !== "index.ts")
    .sort()
    .map((fileName) => `export * from "./${path.parse(fileName).name}";`)
    .join("\n");

  await fs.writeFile(path.join(options.output, "index.ts"), indexContents);

  load.stop();
}
