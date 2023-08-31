import { ContextDefinition } from "jsonld";
import { Schema } from "shexj";
import { JsonLdContextBuilder } from "../context/JsonLdContextBuilder";
import { ShexJNameVisitor } from "../context/ShexJContextVisitor";
import { jsonld2graphobject } from "jsonld2graphobject";
import { ShexJTypingTransformer } from "./ShexJTypingTransformer";
import * as dom from "dts-dom";

export interface TypeingReturn {
  typingsString: string;
  typings: {
    typingString: string;
    dts: dom.TopLevelDeclaration;
  }[];
}

export async function shexjToTyping(
  shexj: Schema
): Promise<[TypeingReturn, ContextDefinition]> {
  const processedShexj: Schema = (await jsonld2graphobject(
    {
      ...shexj,
      "@id": "SCHEMA",
      "@context": "http://www.w3.org/ns/shex.jsonld",
    },
    "SCHEMA"
  )) as unknown as Schema;
  const jsonLdContextBuilder = new JsonLdContextBuilder();
  await ShexJNameVisitor.visit(processedShexj, "Schema", jsonLdContextBuilder);

  const declarations = await ShexJTypingTransformer.transform(
    processedShexj,
    "Schema",
    {
      getNameFromIri:
        jsonLdContextBuilder.getNameFromIri.bind(jsonLdContextBuilder),
    }
  );
  const typings = declarations.map((declaration) => {
    return {
      typingString: dom
        .emit(declaration, {
          rootFlags: dom.ContextFlags.InAmbientNamespace,
        })
        .replace("\r\n", "\n"),
      dts: declaration,
    };
  });
  const typingsString =
    `import {ContextDefinition} from "jsonld"\n\n` +
    typings.map((typing) => `export ${typing.typingString}`).join("");

  const typeingReturn: TypeingReturn = {
    typingsString,
    typings,
  };

  return [typeingReturn, jsonLdContextBuilder.generateJsonldContext()];
}
