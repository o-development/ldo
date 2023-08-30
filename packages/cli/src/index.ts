#!/usr/bin/env node

import { program } from "commander";
import { build } from "./build";
import { init } from "./init";

program
  .name("LDO-CLI")
  .description("CLI to some JavaScript string utilities")
  .version("3.0.1");

program
  .command("build")
  .description("Build a shex folder into Shape Types")
  .option("-i, --input <inputPath>", "Provide the input path", "./shapes")
  .option("-o, --output <outputPath>", "Provide the output path", "./ldo")
  .action(build);

program
  .command("init")
  .option("-d --directory>", "A parent directory for ldo files")
  .description("Initializes a project for ldo")
  .action(init);

program.parse();
