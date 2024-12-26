import { getPackageJson } from "./util/modifyPackageJson";
import { forAllShapes } from "./util/forAllShapes";
import { promises as fs } from "fs";
import path from "path";

interface GenerateReadmeOptions {
  projectFolder: string;
  shapesPath: string;
  ldoPath: string;
}

interface ReadmeEjsOptions {
  projectName: string;
  projectDescription: string;
  shapes: {
    name: string;
    types: {
      typeName: string;
      shapeTypeName: string;
    }[];
    shex: string;
    typescript: string;
  }[];
}

export async function generateReadme(options: GenerateReadmeOptions) {
  const packageJson = await getPackageJson(options.projectFolder);
  const projectName = packageJson.name;
  const projectDescription = packageJson.description;
  const shapes: ReadmeEjsOptions["shapes"] = [];

  await forAllShapes(options.shapesPath, async (fileName, shexC) => {
    const typesRaw = await fs.readFile(
      path.join(options.shapesPath, `${fileName}.typings.ts`),
      "utf8",
    );
    const shapeTypesRaw = await fs.readFile(
      path.join(options.shapesPath, `${fileName}.shapeTypes.ts`),
      "utf8",
    );

    console.log(typesRaw);
    console.log(shapeTypesRaw);

    // shapes.push({
    //   name: fileName,
    //   shex: shexC,
    // });
  });
}
