import * as dom from "dts-dom";
import type { ContextDefinition } from "jsonld";
import { jsonld2graphobject } from "jsonld2graphobject";
import type { Schema } from "shexj";
import { JsonLdContextBuilder } from "../context/JsonLdContextBuilder";
import { ShexJNameVisitor } from "../context/ShexJContextVisitor";
import { ShexJTypingTransformer } from "./ShexJTypingTransformer";

export interface TypeingReturn {
  typingsString: string;
  typings: {
    typingString: string;
    dts: dom.TopLevelDeclaration;
  }[];
}

export type IriNameMap = Record<string, string>;

export async function shexjToTyping(
  shexj: Schema,
  {
    imports = new Map(),
    getImportPaths,
    nameMap,
  }: {
    imports?: Map<string, Schema>;
    getImportPaths: (importIri: string) => { typings: string };
    nameMap?: Record<string, string>;
  },
): Promise<[TypeingReturn, ContextDefinition, IriNameMap | undefined]> {
  const processedShexj: Schema = (await jsonld2graphobject(
    {
      ...shexj,
      "@id": "SCHEMA",
      "@context": "http://www.w3.org/ns/shex.jsonld",
    },
    "SCHEMA",
  )) as unknown as Schema;

  const jsonLdContextBuilder = new JsonLdContextBuilder(nameMap);
  await ShexJNameVisitor.visit(processedShexj, "Schema", jsonLdContextBuilder);

  const declarations = await ShexJTypingTransformer.transform(
    processedShexj,
    "Schema",
    {
      getNameFromIri:
        jsonLdContextBuilder.getNameFromIri.bind(jsonLdContextBuilder),
      async getImportTypings(importIri: string) {
        const shexJ = imports.get(importIri);
        if (!shexJ) return undefined;
        const importTypings = await shexjToTyping(shexJ, {
          getImportPaths,
          nameMap,
        });
        return [importTypings[0], importTypings[1]];
      },
      refsToImport: jsonLdContextBuilder.refsToImport,
      getImportPath: (importIri: string) => getImportPaths(importIri).typings,
    },
  );

  const typings = declarations.map((declaration) => {
    return {
      typingString: dom
        .emit(declaration, {
          rootFlags: dom.ContextFlags.InAmbientNamespace,
        })
        .replace(/\r\n/g, "\n"),
      dts: declaration,
    };
  });

  const typingsString =
    `import type { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\n` +
    typings.map((typing) => `export ${typing.typingString}`).join("");

  const typeingReturn: TypeingReturn = {
    typingsString,
    typings,
  };

  return [
    typeingReturn,
    jsonLdContextBuilder.generateJsonldContext(),
    jsonLdContextBuilder.generatedNames,
  ];
}
