import { init } from "./init";
import { modifyPackageJson, savePackageJson } from "./util/modifyPackageJson";
import { generateReadme } from "./generateReadme";
import path from "path";
import prompts from "prompts";
import type { PackageJson } from "type-fest";

export async function create(directory: string) {
  // Init the NPM Package
  const responses = await prompts([
    {
      type: "text",
      name: "name",
      message: "Package name:",
      initial: path.basename(process.cwd()),
    },
    {
      type: "text",
      name: "version",
      message: "Version:",
      initial: "1.0.0",
    },
    {
      type: "text",
      name: "description",
      message: "Description:",
    },
    {
      type: "list",
      name: "keywords",
      message: "Keywords (comma separated):",
      separator: ",",
    },
    {
      type: "text",
      name: "author",
      message: "Author:",
    },
    {
      type: "text",
      name: "license",
      message: "License:",
      initial: "MIT",
    },
    {
      type: "text",
      name: "repository",
      message: "Git repository (optional):",
    },
  ]);

  const packageJson: PackageJson = {
    name: responses.name,
    version: responses.version,
    description: responses.description,
    keywords: responses.keywords,
    author: responses.author,
    license: responses.license,
  };

  if (responses.repository) {
    packageJson.repository = {
      type: "git",
      url: responses.repository,
    };
    packageJson.bugs = {
      url: `${responses.repository.replace(/\.git$/, "")}/issues`,
    };
    packageJson.homepage = `${responses.repository.replace(
      /\.git$/,
      "",
    )}#readme`;
  }

  await savePackageJson(directory, packageJson);

  // Init LDO
  await init({ directory });

  // Add prepublish script
  await modifyPackageJson(directory, async (packageJson) => {
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
    project: directory,
    shapes: path.join(directory, ".shapes"),
    ldo: path.join(directory, ".ldo"),
  });
}
