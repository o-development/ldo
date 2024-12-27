#!/usr/bin/env node

import { program } from "commander";
import { build } from "./build";
import { init } from "./init";
import { create } from "./create";

program
  .name("LDO-CLI")
  .description("CLI to some JavaScript string utilities")
  .version("3.0.1");

program
  .command("build")
  .description("Build contents of a shex folder into Shape Types")
  .option("-i, --input <inputPath>", "Provide the input path", "./.shapes")
  .option("-o, --output <outputPath>", "Provide the output path", "./.ldo")
  .action(build);

program
  .command("init")
  .argument("[directory]", "A parent directory for ldo files")
  .description("Initializes a project for LDO.")
  .action(init);

program
  .command("create")
  .argument("<directory>", "The package's directory")
  .description("Creates a standalone package for shapes to publish to NPM.")
  .action(create);

program
  .command("generate-readme")
  .description("Create a ReadMe from the shapes and generated code.")
  .requiredOption(
    "-r, --readme <readmePath>",
    "Provide the path to the readme",
    "./.shapes",
  )
  .requiredOption(
    "-s, --shapes <shapesPath>",
    "Provide the path to the shapes folder",
    "./.shapes",
  )
  .requiredOption(
    "-s, --ldo <ldoPath>",
    "Provide the path to the ldo folder",
    "./.ldo",
  )
  .action(build);

program.parse();
