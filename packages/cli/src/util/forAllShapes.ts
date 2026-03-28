import fs from "node:fs/promises";
import path from "path";
import { shaclStoreToShexSchema, writeShexSchema } from "@jeswr/shacl2shex";
import { dereferenceToStore } from "rdf-dereference-store";
import type { Store } from "n3";
import { DataFactory as DF } from "n3";
import { rdf } from "rdf-namespaces";

function hasMatch(store: Store, predicate: string, object: string) {
  for (const _ in store.match(
    null,
    DF.namedNode(predicate),
    DF.namedNode(object),
    DF.defaultGraph(),
  )) {
    return true;
  }
  return false;
}

function isShaclStore(store: Store) {
  return (
    hasMatch(store, rdf.type, "http://www.w3.org/ns/shacl#NodeShape") ||
    hasMatch(store, rdf.type, "http://www.w3.org/ns/shacl#PropertyShape")
  );
}

export async function forAllShapes(
  shapePath: string,
  callback: (filename: string, shape: string) => Promise<void>,
): Promise<void> {
  const shapeDir = await fs.readdir(shapePath, { withFileTypes: true });

  await Promise.all(
    shapeDir.map(async (file) => {
      if (!file.isFile()) return;

      // file name without extension
      const fileName = path.parse(file.name).name;
      // file content as shex or undefined
      const shexC = await readFileAsShex(path.join(shapePath, file.name));

      if (shexC === undefined) return;

      await callback(fileName, shexC);
    }),
  );
}

/**
 * Read shex or shacl shape file, and return it as shex.
 * @param {string} filePath - path to the shape (TODO URI)
 * @return {Promise<string|undefined>} content of the file as shexC, or undefined if it's not a shape
 *
 * @todo maybe throw error instead of returning undefined
 */
export async function readFileAsShex(
  filePath: string,
): Promise<string | undefined> {
  if (filePath.endsWith(".shex")) {
    // read shex
    return await fs.readFile(filePath, "utf8");
  } else {
    // try to read shacl
    try {
      const store = await dereferenceToStore(filePath, { localFiles: true });
      // Make sure the RDF file contains a SHACL shape
      if (isShaclStore(store.store)) {
        return await writeShexSchema(
          await shaclStoreToShexSchema(store.store),
          store.prefixes,
        );
      }
    } catch (e) {}
  }
}
