import fs from "node:fs/promises";
import path from "path";
import type { Schema } from "shexj";
import parser from "@shexjs/parser";
import schemaConverterShex from "@ldo/schema-converter-shex";
import toCamelCase from "camelcase";
import { renderFile } from "ejs";
import prettier from "prettier";
import loading from "loading-cli";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { forAllShapes } from "./util/forAllShapes.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

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
  // Prepare new folder by clearing/and/or creating it
  if (await exists(options.output)) {
    await fs.rm(options.output, { recursive: true });
  }
  await fs.mkdir(options.output);

  load.text = "Generating LDO Documents";
  await forAllShapes(options.input, async (fileName, shexC) => {
    // Convert to ShexJ
    let schema: Schema;
    try {
      schema = parser.construct("https://ldo.js.org/").parse(shexC);
    } catch (err) {
      const errMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown Error";
      console.error(`Error processing ${fileName}: ${errMessage}`);
      return;
    }
    // Convert the content to types
    const [typings, context] = await schemaConverterShex(schema);

    const shapeName = toCamelCase(fileName);

    await Promise.all(
      ["context", "schema", "shapeTypes", "typings"].map(
        async (templateName) => {
          const finalContent = await renderFile(
            path.join(__dirname, "./templates", `${templateName}.ejs`),
            {
              typings: typings.typings,
              fileName,
              shapeName,
              schema: JSON.stringify(schema, null, 2),
              context: JSON.stringify(context, null, 2),
            },
          );
          // Save conversion to document
          await fs.writeFile(
            path.join(options.output, `${fileName}.${templateName}.ts`),
            await prettier.format(finalContent, { parser: "typescript" }),
          );
        },
      ),
    );
  });

  load.stop();
}
