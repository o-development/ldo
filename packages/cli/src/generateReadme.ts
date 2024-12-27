import { getPackageJson } from "./util/modifyPackageJson";
import { forAllShapes } from "./util/forAllShapes";
import { promises as fs } from "fs";
import path from "path";
import { Project } from "ts-morph";
import { renderFile } from "ejs";

interface GenerateReadmeOptions {
  project: string;
  shapes: string;
  ldo: string;
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
  const packageJson = await getPackageJson(options.project);
  const projectName = packageJson.name!;
  const projectDescription = packageJson.description!;
  const shapes: ReadmeEjsOptions["shapes"] = [];

  await forAllShapes(options.shapes, async (fileName, shexC) => {
    const typeFilePath = path.join(options.ldo, `${fileName}.typings.ts`);

    const typesRaw = await fs.readFile(typeFilePath, "utf8");

    const shape: ReadmeEjsOptions["shapes"][0] = {
      name: fileName,
      shex: shexC,
      typescript: typesRaw,
      types: [],
    };

    listInterfaces(typeFilePath).forEach((interfaceName) => {
      shape.types.push({
        typeName: interfaceName,
        shapeTypeName: `${interfaceName}ShapeType`,
      });
    });

    shapes.push(shape);
  });

  const readmeEjsOptions: ReadmeEjsOptions = {
    projectName,
    projectDescription,
    shapes,
  };

  // Save Readme
  const finalContent = await renderFile(
    path.join(__dirname, "./templates/readme/", "main.ejs"),
    readmeEjsOptions,
  );
  // Save readme to document
  await fs.writeFile(path.join(options.project, "README.md"), finalContent);
}

/**
 * Helper Function that lists all the interfaces in a typescript file
 */
function listInterfaces(filePath: string): string[] {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  // Get all interfaces in the file
  const interfaces = sourceFile.getInterfaces().map((iface) => iface.getName());
  return interfaces;
}
