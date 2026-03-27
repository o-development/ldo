import { fs, vol } from "memfs";
import { exec, type ExecException } from "node:child_process";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { build } from "../src/build.js";

const FILES_PER_SHAPE = 5;

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
    expect(outputAfter).toHaveLength(1 * FILES_PER_SHAPE);

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
    expect(outputAfter).toHaveLength(1 * FILES_PER_SHAPE);

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

  it("import ShEx from other file", async () => {
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
    expect(outputAfter).toHaveLength(2 * FILES_PER_SHAPE);

    console.log(Object.keys(vol.toJSON()));

    const result = await fs.promises.readFile(
      "output/person.typings.ts",
      "utf8",
    );

    console.log(result);

    expect(result).toContain(
      'import type { Address as Address2 } from "./address.typings.js"',
    );
  });

  it("Import ShEx from other files (nested)", async () => {
    await fs.promises.mkdir("shapes/nested", { recursive: true });
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
PREFIX city: <./nested/city.shex#>
IMPORT <./nested/city.shex>

ex:Address EXTRA a {
  a [foaf:Address] ;
  foaf:city @<./nested/city.shex#City> ;
}`,
    );
    await fs.promises.writeFile(
      "./shapes/nested/city.shex",
      `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <https://example.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<#City> EXTRA a {
  a [foaf:City] ;
  foaf:name xsd:string ;
}`,
    );
    await expect(
      async () => await fs.promises.readdir("output/"),
    ).rejects.toThrowError();

    await build({ input: "shapes/", output: "output/" });

    const outputAfter = await fs.promises.readdir("output/");
    expect(outputAfter).toHaveLength(3 * FILES_PER_SHAPE);

    console.log(Object.keys(vol.toJSON()));

    const personTypings = await fs.promises.readFile(
      "output/person.typings.ts",
      "utf8",
    );

    const addressTypings = await fs.promises.readFile(
      "output/address.typings.ts",
      "utf8",
    );

    const cityTypings = await fs.promises.readFile(
      "output/city.typings.ts",
      "utf8",
    );

    console.log(personTypings);
    console.log(addressTypings);
    console.log(cityTypings);

    expect(personTypings).toContain(
      'import type { Address as Address2 } from "./address.typings.js"',
    );

    expect(addressTypings).toContain(
      'import type { City as City } from "./city.typings.js"',
    );
  });

  it("Import ShEx from other files (circular)", async () => {
    await fs.promises.mkdir("shapes/nested", { recursive: true });
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
PREFIX city: <./nested/city.shex#>
IMPORT <./nested/city.shex>

ex:Address EXTRA a {
  a [foaf:Address] ;
  ex:city @<./nested/city.shex#City> ;
}`,
    );
    await fs.promises.writeFile(
      "./shapes/nested/city.shex",
      `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <https://example.com/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
IMPORT <../person.shex>


<#City> EXTRA a {
  a [ex:City] ;
  ex:name xsd:string ;
  ex:has_resident @ex:Person * ;
}`,
    );
    await expect(
      async () => await fs.promises.readdir("output/"),
    ).rejects.toThrowError();

    await build({ input: "shapes/", output: "output/" });

    const outputAfter = await fs.promises.readdir("output/");
    expect(outputAfter).toHaveLength(3 * FILES_PER_SHAPE);

    console.log(Object.keys(vol.toJSON()));

    const personTypings = await fs.promises.readFile(
      "output/person.typings.ts",
      "utf8",
    );

    const addressTypings = await fs.promises.readFile(
      "output/address.typings.ts",
      "utf8",
    );

    const cityTypings = await fs.promises.readFile(
      "output/city.typings.ts",
      "utf8",
    );

    console.log(personTypings);
    console.log(addressTypings);
    console.log(cityTypings);

    expect(personTypings).toContain(
      'import type { Address as Address2 } from "./address.typings.js"',
    );

    expect(addressTypings).toContain(
      'import type { City as City } from "./city.typings.js"',
    );

    expect(cityTypings).toContain(
      'import type { Person as Person } from "./person.typings.js"',
    );
  });

  it.todo("Import ShEx from web");
});
