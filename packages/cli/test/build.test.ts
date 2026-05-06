import { fs, vol } from "memfs";
import { exec, type ExecException } from "node:child_process";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { build } from "../src/build.js";

const _runCli = (args: string) => {
  return new Promise<{
    error: ExecException | null;
    stdout: string;
    stderr: string;
  }>((resolve) => {
    exec(`npx tsx ./src/index.ts ${args}`, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
};

describe("cli build", () => {
  // set up in-memory filesystem
  beforeAll(() => {
    vi.mock("node:fs/promises", async () => {
      const memfs = await vi.importActual("memfs");
      const promises = (memfs.fs as typeof fs).promises;
      return { default: promises, ...promises };
    });
  });
  beforeEach(() => {
    vol.reset();
  });

  it("generate shape types", async () => {
    await fs.promises.mkdir("shapes/", { recursive: true });
    await fs.promises.writeFile(
      "shapes/person.shex",
      `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <http://example.com#>

ex:Person EXTRA a {
  a [foaf:Person] ;
  foaf:knows @ex:Person ;
}`,
    );
    await expect(
      async () => await fs.promises.readdir("output/"),
    ).rejects.toThrowError();

    await build({ input: "shapes/", output: "output/" });

    const outputAfter = await fs.promises.readdir("output/");
    expect(outputAfter).toHaveLength(4);

    const result = await fs.promises.readFile(
      "output/person.context.ts",
      "utf8",
    );

    expect(result).toBeTypeOf("string");
  });

  it("handle hyphen in shex filename without failing", async () => {
    await fs.promises.mkdir("shapes/", { recursive: true });
    await fs.promises.writeFile(
      "shapes/person-profile.shex",
      `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <http://example.com#>

ex:Person EXTRA a {
  a [foaf:Person] ;
  foaf:knows @ex:Person ;
}`,
    );
    await expect(
      async () => await fs.promises.readdir("output/"),
    ).rejects.toThrowError();

    await build({ input: "shapes/", output: "output/" });

    const outputAfter = await fs.promises.readdir("output/");
    expect(outputAfter).toHaveLength(4);

    // if we got here, the build has not failed, good!

    for (const output of ["context", "schema", "typings", "shapeTypes"]) {
      const result = await fs.promises.readFile(
        `output/person-profile.${output}.ts`,
        "utf8",
      );

      // visually inspect results
      console.log(result);
    }
  });
});
