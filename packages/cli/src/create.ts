import { init } from "./init";
import { modifyPackageJson, savePackageJson } from "./util/modifyPackageJson";
import { generateReadme } from "./generateReadme";
import path from "path";
import prompts from "prompts";
import type { PackageJson } from "type-fest";
import loading from "loading-cli";
import { promises as fs } from "fs";
import { renderFile } from "ejs";

export async function create(directory: string) {
  // Init the NPM Package
  const responses = await prompts([
    {
      type: "text",
      name: "name",
      message: "Package name:",
      initial: path.basename(directory),
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

  const load = loading("Generating package.json");

  const packageJson: PackageJson = {
    name: responses.name,
    version: responses.version,
    description: responses.description,
    keywords: responses.keywords,
    author: responses.author,
    license: responses.license,
    main: "./index.js",
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
  load.text = "Initializing LDO";
  await init(directory);

  // Add prepublish script
  await modifyPackageJson(directory, async (packageJson) => {
    if (!packageJson.scripts) packageJson.scripts = {};
    packageJson.scripts.prepublish =
      "npm run build:ldo & npm run generate-readme";
    packageJson.scripts[
      "genenerate-readme"
    ] = `ldo generate-readme --project ./ --shapes ./.shapes --ldo ./.ldo`;
    return packageJson;
  });

  // Create index.js
  load.text = "Generating index.js";
  const ldoDir = await fs.readdir(path.join(directory, "./.ldo"), {
    withFileTypes: true,
  });
  const indexText = await renderFile(
    path.join(__dirname, "./templates/readme/projectIndex.ejs"),
    { fileNames: ldoDir.map((file) => file.name) },
  );
  await fs.writeFile(path.join(directory, "index.js"), indexText);

  // Generate ReadMe
  load.text = "Generating README";
  await generateReadme({
    project: directory,
    shapes: path.join(directory, ".shapes"),
    ldo: path.join(directory, ".ldo"),
  });

  load.stop();
}
