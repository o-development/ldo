import type { Annotation } from "shexj";
import type { ContextDefinition, ExpandedTermDefinition } from "jsonld";

/**
 * Name functions
 */
export function iriToName(iri: string): string {
  try {
    const url = new URL(iri);
    if (url.hash) {
      return url.hash.slice(1);
    } else {
      const splitPathname = url.pathname.split("/");
      return splitPathname[splitPathname.length - 1];
    }
  } catch (err) {
    return iri;
  }
}

export function nameFromObject(obj: {
  id?: string;
  annotations?: Annotation[];
}): string | undefined {
  const labelAnnotationObject = obj.annotations?.find(
    (annotation) =>
      annotation.predicate === "http://www.w3.org/2000/01/rdf-schema#label",
  )?.object;
  if (labelAnnotationObject && typeof labelAnnotationObject === "string") {
    return toCamelCase(iriToName(labelAnnotationObject));
  } else if (
    labelAnnotationObject &&
    typeof labelAnnotationObject !== "string"
  ) {
    return toCamelCase(labelAnnotationObject.value);
  } else if (obj.id) {
    return toCamelCase(iriToName(obj.id));
  }
}

export function toCamelCase(text: string) {
  return text
    .replace(/([-_ ]){1,}/g, " ")
    .split(/[-_ ]/)
    .reduce((cur, acc) => {
      return cur + acc[0].toUpperCase() + acc.substring(1);
    });
}

export function isJsonLdContextBuilder(
  item: ExpandedTermDefinition | JsonLdContextBuilder,
): item is JsonLdContextBuilder {
  return !!(typeof item === "object" && item instanceof JsonLdContextBuilder);
}

/**
 * JsonLd Context Builder
 */
export class JsonLdContextBuilder {
  protected iriAnnotations: Record<string, Annotation[]> = {};
  protected iriTypes: Record<
    string,
    ExpandedTermDefinition | JsonLdContextBuilder
  > = {};
  protected generatedNames: Record<string, string> | undefined;

  private getRelevantBuilder(rdfType?: string): JsonLdContextBuilder {
    if (!rdfType) return this;
    if (
      !this.iriTypes[rdfType] ||
      !isJsonLdContextBuilder(this.iriTypes[rdfType])
    ) {
      this.iriTypes[rdfType] = new JsonLdContextBuilder();
    }
    return this.iriTypes[rdfType] as JsonLdContextBuilder;
  }

  addSubject(iri: string, rdfType?: string, annotations?: Annotation[]) {
    const relevantBuilder = this.getRelevantBuilder(rdfType);
    if (!relevantBuilder.iriAnnotations[iri]) {
      relevantBuilder.iriAnnotations[iri] = [];
    }
    if (annotations && annotations.length > 0) {
      relevantBuilder.iriAnnotations[iri].push(...annotations);
    }
  }

  addPredicate(
    iri: string,
    expandedTermDefinition: ExpandedTermDefinition,
    isContainer: boolean,
    rdfType?: string,
    annotations?: Annotation[],
  ) {
    const relevantBuilder = this.getRelevantBuilder(rdfType);
    relevantBuilder.addSubject(iri, undefined, annotations);
    if (!relevantBuilder.iriTypes[iri]) {
      relevantBuilder.iriTypes[iri] = expandedTermDefinition;
      if (isContainer) {
        relevantBuilder.iriTypes[iri]["@isCollection"] = true;
      }
    } else {
      const curDef = relevantBuilder.iriTypes[iri];
      const newDef = expandedTermDefinition;
      // TODO: if you reuse the same predicate with a different cardinality,
      // it will overwrite the past cardinality. Perhapse we might want to
      // split contexts in the various shapes.
      if (isContainer) {
        curDef["@isCollection"] = true;
      }
      // If the old and new versions both have types
      if (curDef["@type"] && newDef["@type"]) {
        if (
          Array.isArray(curDef["@type"]) &&
          !(curDef["@type"] as string[]).includes(newDef["@type"])
        ) {
          curDef["@type"].push(newDef["@type"]);
        } else if (
          typeof curDef["@type"] === "string" &&
          curDef["@type"] !== newDef["@type"]
        ) {
          // The typings are incorrect. String arrays are allowed on @type
          // see https://w3c.github.io/json-ld-syntax/#example-specifying-multiple-types-for-a-node
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          curDef["@type"] = [curDef["@type"], newDef["@type"]];
        }
      }
    }
  }

  generateNames(): Record<string, string> {
    const generatedNames: Record<string, string> = {};
    const claimedNames: Set<string> = new Set();
    Object.entries(this.iriAnnotations).forEach(([iri, annotations]) => {
      let potentialName: string | undefined;
      if (annotations.length > 0) {
        const labelAnnotationObject = annotations.find(
          (annotation) =>
            annotation.predicate ===
            "http://www.w3.org/2000/01/rdf-schema#label",
        )?.object;
        if (
          labelAnnotationObject &&
          typeof labelAnnotationObject === "string"
        ) {
          potentialName = toCamelCase(iriToName(labelAnnotationObject));
        } else if (
          labelAnnotationObject &&
          typeof labelAnnotationObject !== "string"
        ) {
          potentialName = toCamelCase(labelAnnotationObject.value);
        }
      }
      if (!potentialName) {
        potentialName = toCamelCase(iriToName(iri));
      }
      if (claimedNames.has(potentialName)) {
        let i = 2;
        let newName: string | undefined;
        do {
          if (!claimedNames.has(`${potentialName}${i}`)) {
            newName = `${potentialName}${i}`;
          }
          i++;
        } while (!newName);
        potentialName = newName;
      }
      claimedNames.add(potentialName);
      generatedNames[iri] = potentialName;
    });
    return generatedNames;
  }

  getNameFromIri(iri: string, rdfType?: string) {
    const relevantBuilder = this.getRelevantBuilder(rdfType);
    if (!relevantBuilder.generatedNames) {
      relevantBuilder.generatedNames = relevantBuilder.generateNames();
    }
    if (relevantBuilder.generatedNames[iri]) {
      return relevantBuilder.generatedNames[iri];
    } else {
      return iri;
    }
  }

  generateJsonldContext(): ContextDefinition {
    const contextDefnition: ContextDefinition = {};
    const namesMap = this.generateNames();
    Object.entries(namesMap).forEach(([iri, name]) => {
      if (this.iriTypes[iri]) {
        let subContext: ExpandedTermDefinition = {
          "@id":
            iri === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              ? "@type"
              : iri,
        };

        if (isJsonLdContextBuilder(this.iriTypes[iri])) {
          subContext["@context"] = (
            this.iriTypes[iri] as JsonLdContextBuilder
          ).generateJsonldContext();
        } else {
          subContext = {
            ...subContext,
            ...this.iriTypes[iri],
          };
        }

        contextDefnition[name] = subContext;
      } else {
        contextDefnition[name] = iri;
      }
    });

    return contextDefnition;
  }
}
