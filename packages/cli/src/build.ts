import fs from "fs-extra";
import path from "path";
import type { Schema } from "shexj";
import parser from "@shexjs/parser";
import schemaConverterShex from "@ldo/schema-converter-shex";
import { renderFile } from "ejs";
import prettier from "prettier";
import loading from "loading-cli";
import { forAllShapes } from "./util/forAllShapes";

interface BuildOptions {
  input: string;
  output: string;
}

export async function build(options: BuildOptions) {
  const load = loading("Peparing Environment");
  load.start();
  // Prepare new folder by clearing/and/or creating it
  if (fs.existsSync(options.output)) {
    await fs.promises.rm(options.output, { recursive: true });
  }
  await fs.promises.mkdir(options.output);

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
    await Promise.all(
      ["context", "schema", "shapeTypes", "typings"].map(
        async (templateName) => {
          const finalContent = await renderFile(
            path.join(__dirname, "./templates", `${templateName}.ejs`),
            {
              typings: typings.typings,
              fileName,
              schema: JSON.stringify(schema, null, 2),
              context: JSON.stringify(context, null, 2),
            },
          );
          // Save conversion to document
          await fs.promises.writeFile(
            path.join(options.output, `${fileName}.${templateName}.ts`),
            await prettier.format(finalContent, { parser: "typescript" }),
          );
        },
      ),
    );
  });

  load.stop();
}
