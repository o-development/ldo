import type { Annotation, valueSetValue } from "shexj";
import type { ExpandedTermDefinition } from "jsonld";
import type { LdoJsonldContext } from "@ldo/jsonld-dataset-proxy";
import { hashValueSetValue } from "./util/hashValueSetValue";

/**
 * Name functions
 */
export function iriToName(iri: string): string {
  try {
    const url = new URL(iri);
    let name: string;
    if (url.hash) {
      name = url.hash.slice(1);
    } else {
      const splitPathname = url.pathname.split("/");
      name = splitPathname[splitPathname.length - 1];
    }
    return name.replace(/(?<!^)Shape$/, "");
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
  public iriTypes: Record<
    string,
    ExpandedTermDefinition | JsonLdContextBuilder
  > = {};
  generatedNames: Record<string, string> | undefined;

  // shex imports
  imports: Set<string> = new Set();
  // IRIs that we may need to find in shex imports (not defined locally)
  refsToImport: Set<string> = new Set();

  constructor(initialNames?: Record<string, string>) {
    if (initialNames) this.generatedNames = { ...initialNames };
  }

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

  private getRelevantBuilders(rdfType?: string): JsonLdContextBuilder[] {
    const relevantBuilder = this.getRelevantBuilder(rdfType);
    return relevantBuilder === this ? [this] : [this, relevantBuilder];
  }

  addSubject(iri: string, rdfType?: string, annotations?: Annotation[]) {
    const relevantBuilders = this.getRelevantBuilders(rdfType);
    relevantBuilders.forEach((relevantBuilder) => {
      if (!relevantBuilder.iriAnnotations[iri]) {
        relevantBuilder.iriAnnotations[iri] = [];
      }
      if (annotations && annotations.length > 0) {
        relevantBuilder.iriAnnotations[iri].push(...annotations);
      }
    });
  }

  addPredicate(
    iri: string,
    expandedTermDefinition: ExpandedTermDefinition,
    isContainer: boolean,
    rdfType?: string,
    annotations?: Annotation[],
    associatedValues?: valueSetValue[],
  ) {
    const relevantBuilders = this.getRelevantBuilders(rdfType);

    relevantBuilders.forEach((relevantBuilder) => {
      relevantBuilder.addSubject(iri, undefined, annotations);

      // If there are multiple associated
      const associatedValuesSet = new Set(
        associatedValues?.map((val) => hashValueSetValue(val)),
      );

      if (!relevantBuilder.iriTypes[iri]) {
        relevantBuilder.iriTypes[iri] = { ...expandedTermDefinition };
        if (
          isContainer ||
          associatedValuesSet.size > 1 ||
          iri === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        ) {
          relevantBuilder.iriTypes[iri]["@isCollection"] = true;
        }
        if (associatedValuesSet.size > 0) {
          relevantBuilder.iriTypes[iri]["@associatedValues"] =
            associatedValuesSet;
        }
      } else {
        const curDef = relevantBuilder.iriTypes[iri];
        const newDef = expandedTermDefinition;
        if (isContainer) {
          curDef["@isCollection"] = true;
        }
        // If there's a different associated value, it must be a collection because you can have multiple types
        if (associatedValuesSet.size > 0) {
          if (associatedValuesSet.size > 1) {
            relevantBuilder.iriTypes[iri]["@isCollection"] = true;
          }
          const existingSet = curDef["@associatedValues"];
          if (!existingSet) {
            curDef["@associatedValues"] = new Set(associatedValuesSet);
            curDef["@isCollection"] = true;
          } else {
            const oldAssociatedValueSetSize = existingSet.size;
            associatedValuesSet.forEach((val) => existingSet.add(val));
            if (existingSet.size !== oldAssociatedValueSetSize) {
              curDef["@isCollection"] = true;
            }
          }
        }
        // If the old and new versions both have types
        if (curDef["@type"] && newDef["@type"]) {
          if (curDef["@type"] !== newDef["@type"]) {
            console.warn(
              `You've specified that a specific field "${iri}" can have an object of multiple literal types (${curDef["@type"]} or ${newDef["@type"]}). This is not expressable in JSON-LD context, and we will randomly select one type to use.`,
            );
          }
        }
      }
    });
  }

  /**
   * Add IRI that we might need to search in shex imports
   * @param iri
   */
  addIriToImport(iri: string) {
    this.refsToImport.add(iri);
  }

  /**
   * Add shex import
   * @param iri
   */
  addImport(iri: string) {
    this.imports.add(iri);
  }

  generateNames(): Record<string, string> {
    const generatedNames: Record<string, string> = { ...this.generatedNames };
    const claimedNames: Set<string> = new Set(Object.values(generatedNames));
    Object.entries(this.iriAnnotations).forEach(([iri, annotations]) => {
      if (generatedNames[iri]) return;
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
    // if (!relevantBuilder.generatedNames) {
    relevantBuilder.generatedNames = relevantBuilder.generateNames();
    // }

    if (relevantBuilder.generatedNames[iri]) {
      return relevantBuilder.generatedNames[iri];
    } else {
      return iri;
    }
  }

  generateJsonldContext(): LdoJsonldContext {
    const contextDefnition: LdoJsonldContext = {};
    const namesMap = this.generateNames();

    Object.entries(namesMap).forEach(([iri, name]) => {
      // FIX: Only output if the IRI was actually declared in this file
      if (!this.iriAnnotations[iri]) return;

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
        delete subContext["@associatedValues"];

        contextDefnition[name] = subContext;
      } else {
        contextDefnition[name] = iri;
      }
    });

    return contextDefnition;
  }
}
