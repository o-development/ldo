import { exec } from "child-process-promise";
import { init } from "./init";
import { modifyPackageJson } from "./util/modifyPackageJson";
import { generateReadme } from "./generateReadme";
import path from "path";

interface CreateOptions {
  directory: string;
  name: string;
}

export async function create(options: CreateOptions) {
  // Init the NPM Package
  await exec(`npm init ${options.directory}`);

  // Init LDO
  await init({ directory: options.directory });

  // Add prepublish script
  await modifyPackageJson(async (packageJson) => {
    if (!packageJson.scripts) packageJson.scripts = {};
    packageJson.scripts.prepublish =
      "npm run build:ldo & npm run generate-readme";
    packageJson.scripts[
      "genenerate-readme"
    ] = `ldo generate-readme --readme ./README.md --shapes ./.shapes --ldo ./ldo`;
    return packageJson;
  });

  // Generate ReadMe
  await generateReadme({
    readmePath: path.join(options.directory, "README.md"),
    shapesPath: path.join(options.directory, ".shapes"),
    ldoPath: path.join(options.directory, ".ldo"),
  });
}
