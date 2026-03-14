import path from "path";
import type { Schema } from "shexj";
import schemaConverterShex from "@ldo/schema-converter-shex";
import { renderFile } from "ejs";
import prettier from "prettier";
import loading from "loading-cli";
import fs from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readShapesDeep } from "./util/readShapes.js";

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
  await fs.mkdir(options.output, { recursive: true });

  load.text = "Generating LDO Documents";

  // first, fetch the shex files and their dependencies
  // It is a map of path or URL, and shape
  const shapeMap = await readShapesDeep(options.input);

  for (const [uri, shapeData] of shapeMap) {
    if (!shapeData) continue;

    const imports = new Map<string, Schema>();
    for (const importUri of shapeData.shexJ.imports ?? []) {
      const shexJ = shapeMap.get(importUri)?.shexJ;
      if (shexJ === undefined) continue;
      imports.set(importUri, shexJ);
    }

    // Convert the content to types
    const [typings, context] = await schemaConverterShex(shapeData.shexJ, {
      getImportPaths: (importIri) => {
        const fileName = path.parse(importIri).name;
        return { typings: `./${fileName}.typings.ts` };
      },
      imports,
    });

    // console.log(typings, context);

    // TODO maybe uri should be converted
    const fileName = path.parse(uri).name;

    await Promise.all(
      ["context", "schema", "shapeTypes", "typings"].map(
        async (templateName) => {
          const finalContent = await renderFile(
            path.join(__dirname, "./templates", `${templateName}.ejs`),
            {
              typings: typings.typings,
              fileName,
              schema: JSON.stringify(shapeData.shexJ, null, 2),
              context: JSON.stringify(context, null, 2),
            },
          );
          // console.log(fileName, templateName, finalContent);
          // Save conversion to document
          await fs.writeFile(
            path.join(options.output, `${fileName}.${templateName}.ts`),
            await prettier.format(finalContent, { parser: "typescript" }),
          );
        },
      ),
    );
  }

  // await forAllShapes(options.input, async (fileName, shexC) => {
  //   // Convert to ShexJ
  //   let schema: Schema;
  //   try {
  //     schema = parser.construct(options.input).parse(shexC);
  //     console.log(JSON.stringify(schema, null, 2));
  //   } catch (err) {
  //     const errMessage =
  //       err instanceof Error
  //         ? err.message
  //         : typeof err === "string"
  //         ? err
  //         : "Unknown Error";
  //     console.error(`Error processing ${fileName}: ${errMessage}`);
  //     return;
  //   }

  //   // Convert the content to types
  //   const [typings, context] = await schemaConverterShex(schema);

  //   // console.log(typings, context);

  //   await Promise.all(
  //     ["context", "schema", "shapeTypes", "typings"].map(
  //       async (templateName) => {
  //         const finalContent = await renderFile(
  //           path.join(__dirname, "./templates", `${templateName}.ejs`),
  //           {
  //             typings: typings.typings,
  //             fileName,
  //             schema: JSON.stringify(schema, null, 2),
  //             context: JSON.stringify(context, null, 2),
  //           },
  //         );
  //         // console.log(fileName, templateName, finalContent);
  //         // Save conversion to document
  //         await fs.writeFile(
  //           path.join(options.output, `${fileName}.${templateName}.ts`),
  //           await prettier.format(finalContent, { parser: "typescript" }),
  //         );
  //       },
  //     ),
  //   );
  // });

  load.stop();
}
