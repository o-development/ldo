import { exec } from "child-process-promise";
import fs from "fs-extra";
import path from "path";
import { renderFile } from "ejs";
import { modifyPackageJson } from "./util/modifyPackageJson";

const DEFAULT_SHAPES_FOLDER = "./.shapes";
const DEFAULT_LDO_FOLDER = "./.ldo";
const POTENTIAL_PARENT_DIRECTORIES = ["src", "lib", "bin"];

export async function init(directory?: string) {
  // Find folder to save to
  let parentDirectory = directory!;
  if (!parentDirectory) {
    parentDirectory = "./";
    const allDirectories = (
      await fs.promises.readdir("./", {
        withFileTypes: true,
      })
    ).filter((file) => file.isDirectory());
    for (let i = 0; i < POTENTIAL_PARENT_DIRECTORIES.length; i++) {
      if (
        allDirectories.some(
          (dir) => dir.name === POTENTIAL_PARENT_DIRECTORIES[i],
        )
      ) {
        parentDirectory = POTENTIAL_PARENT_DIRECTORIES[i];
        break;
      }
    }
  }

  // Install dependencies
  await exec(`cd ${parentDirectory} && npm install @ldo/ldo --save`);
  await exec(
    `cd ${parentDirectory} && npm install @ldo/cli @types/shexj @types/jsonld --save-dev`,
  );

  // Create "shapes" folder
  const shapesFolderPath = path.join(parentDirectory, DEFAULT_SHAPES_FOLDER);
  await fs.promises.mkdir(shapesFolderPath);
  const defaultShapePaths = await fs.promises.readdir(
    path.join(__dirname, "./templates/defaultShapes"),
  );
  await Promise.all(
    defaultShapePaths.map(async (shapePath) => {
      const shapeContent = await renderFile(
        path.join(__dirname, "./templates/defaultShapes", shapePath),
        {},
      );
      await fs.promises.writeFile(
        path.join(shapesFolderPath, `${path.parse(shapePath).name}.shex`),
        shapeContent,
      );
    }),
  );

  // Add build script
  await modifyPackageJson(parentDirectory, async (packageJson) => {
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    const ldoFolder = path.join(parentDirectory, DEFAULT_LDO_FOLDER);
    packageJson.scripts["build:ldo"] = `ldo build --input ${path.relative(
      parentDirectory,
      shapesFolderPath,
    )} --output ${path.relative(parentDirectory, ldoFolder)}`;
    return packageJson;
  });

  // Build LDO
  await exec(`cd ${parentDirectory} && npm run build:ldo`);
}
