import ShexJTraverser from "@ldo/traverser-shexj";
import * as dom from "dts-dom";
import type { Annotation } from "shexj";
import { nameFromObject } from "../context/JsonLdContextBuilder";
import type { ShapeInterfaceDeclaration } from "./ShapeInterfaceDeclaration";
import { getRdfTypesForTripleConstraint } from "../util/getRdfTypesForTripleConstraint";
import { dedupeObjectTypeMembers } from "./util/dedupeObjectTypeMembers";
import {
  getDomTypeforDatatype,
  primitiveKindFromDatatype,
  primitiveKindToType,
} from "./util/getDomTypesForDatatype.js";
import { getPropertyDeclarations } from "./util/getPropertyDeclaration.js";

export interface ShexJTypeTransformerContext {
  getNameFromIri: (iri: string, rdfType?: string) => string;
}

export function commentFromAnnotations(
  annotations?: Annotation[],
): string | undefined {
  const commentAnnotationObject = annotations?.find(
    (annotation) =>
      annotation.predicate === "http://www.w3.org/2000/01/rdf-schema#comment",
  )?.object;
  if (typeof commentAnnotationObject === "string") {
    // It's an IRI
    return commentAnnotationObject;
  } else {
    return commentAnnotationObject?.value;
  }
}

export const ShexJTypingTransformer = ShexJTraverser.createTransformer<
  {
    Schema: {
      return: dom.TopLevelDeclaration[];
    };
    ShapeDecl: {
      return: dom.InterfaceDeclaration;
    };
    Shape: {
      return: dom.InterfaceDeclaration;
    };
    EachOf: {
      return: dom.ObjectType | dom.InterfaceDeclaration;
    };
    OneOf: {
      return: dom.ObjectType;
    };
    TripleConstraint: {
      return: dom.PropertyDeclaration;
    };
    NodeConstraint: {
      return: dom.Type;
    };
    ShapeOr: {
      return: dom.UnionType;
    };
    ShapeAnd: {
      return: dom.IntersectionType;
    };
    ShapeNot: {
      return: never;
    };
    ShapeExternal: {
      return: never;
    };
  },
  ShexJTypeTransformerContext
>({
  Schema: {
    transformer: async (
      _schema,
      getTransformedChildren,
    ): Promise<dom.TopLevelDeclaration[]> => {
      const transformedChildren = await getTransformedChildren();
      const interfaces: dom.TopLevelDeclaration[] = [];
      transformedChildren.shapes?.forEach((shape) => {
        if (
          typeof shape !== "string" &&
          (shape as dom.InterfaceDeclaration).kind === "interface"
        ) {
          interfaces.push(shape as dom.InterfaceDeclaration);
        }
      });
      return interfaces;
    },
  },
  ShapeDecl: {
    transformer: async (
      shapeDecl,
      getTransformedChildren,
    ): Promise<dom.InterfaceDeclaration> => {
      const shapeName = nameFromObject(shapeDecl) || "Shape";
      const { shapeExpr } = await getTransformedChildren();
      if ((shapeExpr as dom.InterfaceDeclaration).kind === "interface") {
        const shapeInterface = shapeExpr as ShapeInterfaceDeclaration;
        shapeInterface.name = shapeName;
        // This exists so the LDO-CLI can understand which type corresponds to the shape
        shapeInterface.shapeId = shapeDecl.id;
        return shapeInterface;
      } else {
        // TODO: Handle other items
        throw new Error(
          "Cannot handle ShapeOr, ShapeAnd, ShapeNot, ShapeExternal, or NodeConstraint direcly on ShapeDecl.",
        );
      }
    },
  },
  Shape: {
    transformer: async (shape, getTransformedChildren, setReturnPointer) => {
      const newInterface: ShapeInterfaceDeclaration = dom.create.interface("");
      setReturnPointer(newInterface);
      const transformedChildren = await getTransformedChildren();
      // Add @id and @context
      newInterface.members.push(
        dom.create.property(
          "@id",
          dom.type.string,
          dom.DeclarationFlags.Optional,
        ),
      );
      newInterface.members.push(
        dom.create.property(
          "@context",
          dom.create.namedTypeReference("LdoJsonldContext"),
          dom.DeclarationFlags.Optional,
        ),
      );
      if (typeof transformedChildren.expression === "string") {
        // TODO: handle string
      } else if (
        (transformedChildren.expression as dom.ObjectType).kind === "object" ||
        (transformedChildren.expression as dom.InterfaceDeclaration).kind ===
          "interface"
      ) {
        newInterface.members.push(
          ...(transformedChildren.expression as dom.ObjectType).members,
        );
      } else if (
        (transformedChildren.expression as dom.PropertyDeclaration).kind ===
        "property"
      ) {
        newInterface.members.push(
          transformedChildren.expression as dom.PropertyDeclaration,
        );
      }
      // Use EXTENDS
      if (transformedChildren.extends) {
        transformedChildren.extends.forEach((extendsItem) => {
          const extendsInterface = extendsItem as dom.InterfaceDeclaration;
          if (extendsInterface.kind === "interface") {
            // NOTE: This is how you would use the actual typescript "extends"
            // feature, but as ShEx extend doesn't work the same way as ts
            // extends, we just dedupe and push members.
            // newInterface.baseTypes?.push(
            //   extendsItem as dom.InterfaceDeclaration,
            // );
            newInterface.members = dedupeObjectTypeMembers([
              ...extendsInterface.members,
              ...newInterface.members,
            ]);
          }
        });
      }
      return newInterface;
    },
  },
  EachOf: {
    transformer: async (eachOf, getTransformedChildren, setReturnPointer) => {
      const transformedChildren = await getTransformedChildren();
      const name = nameFromObject(eachOf);
      const objectType = name
        ? dom.create.interface(name)
        : dom.create.objectType([]);
      setReturnPointer(objectType);
      // Get Input property expressions
      const inputPropertyExpressions = transformedChildren.expressions.flatMap(
        getPropertyDeclarations,
      );
      objectType.members.push(
        ...dedupeObjectTypeMembers(inputPropertyExpressions),
      );
      return objectType;
    },
  },
  OneOf: {
    transformer: async (oneOf, getTransformedChildren, setReturnPointer) => {
      const transformedChildren = await getTransformedChildren();
      const propertyDeclarations = transformedChildren.expressions.flatMap(
        getPropertyDeclarations,
      );
      const objectType = dom.create.objectType(
        dedupeObjectTypeMembers(propertyDeclarations, "union"),
      );
      setReturnPointer(objectType);
      return objectType;
    },
  },
  TripleConstraint: {
    transformer: async (
      tripleConstraint,
      getTransformedChildren,
      setReturnPointer,
      node,
      context,
    ) => {
      const transformedChildren = await getTransformedChildren();

      const rdfTypes = getRdfTypesForTripleConstraint(node);

      // HACK: Selecting only one RDFType might cause edge cases children in the
      // heirarchy that have different predicate names.
      const propertyName = context.getNameFromIri(
        tripleConstraint.predicate,
        rdfTypes[0],
      );
      const isSet =
        (tripleConstraint.max !== undefined && tripleConstraint.max !== 1) ||
        tripleConstraint.predicate ===
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
      const isOptional = tripleConstraint.min === 0;
      let type: dom.Type = dom.type.any;
      if (transformedChildren.valueExpr) {
        type = transformedChildren.valueExpr as dom.Type;
      }

      const propertyDeclaration = dom.create.property(
        propertyName,
        isSet
          ? {
              kind: "name",
              name: "LdSet",
              typeArguments: [type],
            }
          : type,
        isOptional ? dom.DeclarationFlags.Optional : dom.DeclarationFlags.None,
      );

      propertyDeclaration.jsDocComment = commentFromAnnotations(
        tripleConstraint.annotations,
      );
      return propertyDeclaration;
    },
  },
  NodeConstraint: {
    transformer: async (
      nodeConstraint,
      _getTransformedChildren,
      setReturnPointer,
      node,
      context,
    ) => {
      if (nodeConstraint.datatype) {
        return getDomTypeforDatatype(nodeConstraint.datatype);
      }
      if (nodeConstraint.nodeKind) {
        switch (nodeConstraint.nodeKind) {
          case "iri":
            return dom.create.objectType([
              dom.create.property("@id", dom.type.string),
            ]);
          case "bnode":
            return dom.create.objectType([]);
          case "nonliteral":
            return dom.create.objectType([
              dom.create.property(
                "@id",
                dom.type.string,
                dom.DeclarationFlags.Optional,
              ),
            ]);
          case "literal":
          default:
            return dom.type.string;
        }
      }
      if (nodeConstraint.values) {
        if (nodeConstraint.values.length === 0) {
          throw new Error("NodeConstraint.values must not be empty");
        }

        const valuesUnionMemberSet = new Set<dom.Type>();
        nodeConstraint.values.forEach((value) => {
          if (typeof value === "string") {
            // Exact IRI
            valuesUnionMemberSet.add(
              dom.create.objectType([
                dom.create.property(
                  "@id",
                  dom.type.stringLiteral(context.getNameFromIri(value)),
                ),
              ]),
            );
          } else if ("value" in value) {
            // Exact RDF literal
            const datatype =
              ("datatype" in value && typeof value.datatype === "string"
                ? value.datatype
                : undefined) ?? value.type;

            const kind = primitiveKindFromDatatype(datatype);

            if (kind === "string") {
              // Preserve exact string literal types.
              valuesUnionMemberSet.add(dom.type.stringLiteral(value.value));
            } else {
              // Use primitive types for numbers and booleans.
              valuesUnionMemberSet.add(primitiveKindToType(kind));
            }
          }
          // TODO support for stem and stem-range values, language tags
        });

        return dom.create.union(Array.from(valuesUnionMemberSet));
      }
      return dom.type.undefined;
    },
  },
  ShapeOr: {
    transformer: async (shapeOr, getTransformedChildren) => {
      const transformedChildren = await getTransformedChildren();
      const validTypes: dom.Type[] = [];
      transformedChildren.shapeExprs.forEach((type) => {
        if (typeof type === "object") validTypes.push(type);
      });
      return dom.create.union(validTypes);
    },
  },
  ShapeAnd: {
    transformer: async (shapeAnd, getTransformedChildren) => {
      const transformedChildren = await getTransformedChildren();
      const validTypes: dom.Type[] = [];
      transformedChildren.shapeExprs.forEach((type) => {
        if (typeof type === "object") validTypes.push(type);
      });
      return dom.create.intersection(validTypes);
    },
  },
  ShapeNot: {
    transformer: async () => {
      throw new Error("ShapeNot is not supported");
    },
  },
  ShapeExternal: {
    transformer: async () => {
      throw new Error("ShapeExternal is not supported");
    },
  },
});
