import fs from "fs-extra";
import path from "path";
import type { Schema } from "shexj";
import parser from "@shexjs/parser";
import schemaConverterShex from "@ldobjects/schema-converter-shex";
import { renderFile } from "ejs";
import prettier from "prettier";
import loading from "loading-cli";

interface BuildOptions {
  input: string;
  output: string;
}

export async function build(options: BuildOptions) {
  const load = loading("Peparing Environment");
  load.start();
  const shapeDir = await fs.promises.readdir(options.input, {
    withFileTypes: true,
  });
  // Filter out non-shex documents
  const shexFiles = shapeDir.filter(
    (file) => file.isFile() && file.name.endsWith(".shex"),
  );
  // Prepare new folder by clearing/and/or creating it
  if (fs.existsSync(options.output)) {
    await fs.promises.rm(options.output, { recursive: true });
  }
  await fs.promises.mkdir(options.output);

  load.text = "Generating LDO Documents";
  await Promise.all(
    shexFiles.map(async (file) => {
      const fileName = path.parse(file.name).name;
      // Get the content of each document
      const shexC = await fs.promises.readFile(
        path.join(options.input, file.name),
        "utf8",
      );
      // Convert to ShexJ
      const schema: Schema = parser
        .construct("https://ldo.js.org/")
        .parse(shexC);
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
    }),
  );
  load.stop();
}
