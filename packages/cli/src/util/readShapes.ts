import type { Schema } from "shexj";
import fs from "node:fs/promises";
import path from "node:path";
import { readFileAsShex } from "./forAllShapes.js";
import parser from "@shexjs/parser";
import { pathToFileURL, fileURLToPath } from "node:url";

export interface ShapeData {
  shexC: string;
  shexJ: Schema;
}

/**
 * Map of IRI (including local IRI) to shex data
 */
export type ShapeMap = Map<string, ShapeData | undefined>;

/**
 * Fetch shape and its imports into shapeMap
 * @param fileUrl
 * @param shapeMap
 * @returns
 */
export async function readShapeDeep(
  fileUrl: URL,
  shapeMap: ShapeMap = new Map(),
): Promise<ShapeMap> {
  // stop if already importing
  if (shapeMap.has(fileUrl.toString())) return shapeMap;

  // signal that the processing has already started
  shapeMap.set(fileUrl.toString(), undefined);

  const filePath = fileURLToPath(fileUrl);

  const shexC = await readFileAsShex(filePath);

  if (typeof shexC === "string") {
    try {
      // Convert to ShexJ
      const shexJ = parser.construct(fileUrl.toString()).parse(shexC);
      shapeMap.set(fileUrl.toString(), { shexC, shexJ });

      // Load imports
      for (const importLink of shexJ.imports ?? []) {
        const importUri = new URL(importLink, fileUrl);
        await readShapeDeep(importUri, shapeMap);
      }
    } catch (err) {
      const errMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown Error";
      console.error(`Error processing ${filePath}: ${errMessage}`);
    }
  }

  return shapeMap;
}

export async function readShapesDeep(shapeDir: string): Promise<ShapeMap> {
  const shapeMap: ShapeMap = new Map();

  const shapeFiles = await fs.readdir(shapeDir, { withFileTypes: true });

  for (const file of shapeFiles) {
    if (!file.isFile()) continue;
    await readShapeDeep(
      pathToFileURL(path.join(shapeDir, file.name)),
      shapeMap,
    );
  }

  return shapeMap;
}
