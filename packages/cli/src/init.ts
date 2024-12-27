import { exec } from "child-process-promise";
import fs from "fs-extra";
import path from "path";
import { renderFile } from "ejs";
import { modifyPackageJson } from "./util/modifyPackageJson";

const DEFAULT_SHAPES_FOLDER = "./.shapes";
const DEFAULT_LDO_FOLDER = "./.ldo";
const POTENTIAL_PARENT_DIRECTORIES = ["src", "lib", "bin"];

export interface InitOptions {
  directory?: string;
}

export async function init(initOptions: InitOptions) {
  console.log("In init");
  // Install dependencies
  await exec(`cd ${initOptions.directory} && npm install @ldo/ldo --save`);
  await exec(
    `cd ${initOptions.directory} && npm install @ldo/cli @types/shexj @types/jsonld --save-dev`,
  );

  // Find folder to save to
  let parentDirectory = initOptions.directory!;
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

  console.log("here");
  // Add build script
  await modifyPackageJson(parentDirectory, async (packageJson) => {
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    const ldoFolder = path.join(parentDirectory, DEFAULT_LDO_FOLDER);
    packageJson.scripts[
      "build:ldo"
    ] = `ldo build --input ${shapesFolderPath} --output ${ldoFolder}`;
    return packageJson;
  });

  // Build LDO
  await exec("npm run build:ldo");
}
