import fs from "node:fs/promises";
import path from "node:path";
import type { Schema } from "shexj";
import schemaConverterShex from "@ldo/schema-converter-shex";
import camelCase from "camelcase";
import { renderFile } from "ejs";
import prettier from "prettier";
import loading from "loading-cli";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readShapeDeep, readShapesDeep } from "./util/readShapes.js";
import { ESLint } from "eslint";

const eslint = new ESLint({
  fix: true,
  useEslintrc: false,
  baseConfig: {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["plugin:@typescript-eslint/recommended"],
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
});

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

  // console.log(shapeMap);

  let nameMap: Record<string, string> | undefined = undefined;

  // first build unique map of uri => name for the contexts
  // TODO this is now global, but it can be isolated per import
  for (const [, shapeData] of shapeMap) {
    // console.log("-------------------------------------- round1", uri);
    if (!shapeData) continue;

    const imports = new Map<string, Schema>();
    for (const importUri of shapeData.shexJ.imports ?? []) {
      const shexJ = shapeMap.get(importUri)?.shexJ;
      if (shexJ === undefined) continue;
      imports.set(importUri, shexJ);
    }

    // Convert the content to types
    const [, , nm_] = await schemaConverterShex(shapeData.shexJ, {
      getImportPaths: (importIri) => {
        const fileName = path.parse(importIri).name;
        return { typings: `./${fileName}.typings.js` };
      },
      imports,
      nameMap,
    });

    if (nm_) nameMap = nm_;
  }

  for (const [uri, shapeData] of shapeMap) {
    // console.log("222222-------------------------------- round2", uri);
    if (!shapeData) continue;

    const shapeImportsDeep = await readShapeDeep(new URL(uri));

    const imports = new Map<string, Schema>();
    for (const importUri of shapeData.shexJ.imports ?? []) {
      const shexJ = shapeMap.get(importUri)?.shexJ;
      if (shexJ === undefined) continue;
      imports.set(importUri, shexJ);
    }

    // Convert the content to types
    const [typings, context, nm_] = await schemaConverterShex(shapeData.shexJ, {
      getImportPaths: (importIri) => {
        const fileName = path.parse(importIri).name;
        return { typings: `./${fileName}.typings.js` };
      },
      imports,
      nameMap,
    });

    if (nm_) nameMap = nm_;

    // TODO maybe uri should be converted
    const fileName = path.parse(uri).name;

    // console.log(JSON.stringify(typings, null, 2));

    const importFileNames = Array.from(shapeImportsDeep.keys()).map(
      (uri) => path.parse(uri).name,
    );

    await Promise.all(
      ["partialContext", "context", "schema", "shapeTypes", "typings"].map(
        async (templateName) => {
          const filePath = path.join(
            options.output,
            `${fileName}.${templateName}.ts`,
          );

          const finalContent = await renderFile(
            path.join(__dirname, "./templates", `${templateName}.ejs`),
            {
              typings: typings.typings,
              fileName,
              imports: importFileNames,
              schema: JSON.stringify(shapeData.shexJ, null, 2),
              context: JSON.stringify(context, null, 2),
              camelCase,
            },
          );

          const lintedContent = await eslint.lintText(finalContent, {
            filePath,
          });
          const fixedContent = lintedContent[0].output ?? finalContent;
          // console.log(fileName, templateName, finalContent);
          // Save conversion to document
          await fs.writeFile(
            filePath,
            await prettier.format(fixedContent, { parser: "typescript" }),
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
