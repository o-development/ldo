import { fs, vol } from "memfs";
import { exec, type ExecException } from "node:child_process";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { build } from "../src/build.js";

const runCli = (args: string) => {
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

    console.log(result);
  });

  it.only("import ShEx from other file", async () => {
    await fs.promises.mkdir("shapes/", { recursive: true });
    await fs.promises.writeFile(
      "shapes/person.shex",
      `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <https://example.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
IMPORT <./address.shex>

ex:Person EXTRA a {
  a [foaf:Person] ;
  foaf:knows @ex:Person *;
  foaf:address @ex:Address *;
  foaf:name xsd:string ;
  foaf:homepage IRI ;
}`,
    );
    await fs.promises.writeFile(
      "shapes/address.shex",
      `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <https://example.com/>

ex:Address EXTRA a {
  a [foaf:Address] ;
}`,
    );
    await expect(
      async () => await fs.promises.readdir("output/"),
    ).rejects.toThrowError();

    await build({ input: "shapes/", output: "output/" });

    const outputAfter = await fs.promises.readdir("output/");
    expect(outputAfter).toHaveLength(8);

    console.log(Object.keys(vol.toJSON()));

    const result = await fs.promises.readFile(
      "output/person.typings.ts",
      "utf8",
    );

    console.log(result);
  });
  it.todo("Import ShEx from other files (nested)");

  it.todo("Import ShEx from other files (circular)");

  it.todo("Import ShEx from web");
});
