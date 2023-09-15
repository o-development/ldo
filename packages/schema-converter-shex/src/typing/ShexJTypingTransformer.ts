import ShexJTraverser from "@ldo/traverser-shexj";
import * as dom from "dts-dom";
import type { Annotation } from "shexj";
import { nameFromObject } from "../context/JsonLdContextBuilder";
import type { ShapeInterfaceDeclaration } from "./ShapeInterfaceDeclaration";

export interface ShexJTypeTransformerContext {
  getNameFromIri: (iri: string) => string;
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
    TripleConstraint: {
      return: dom.PropertyDeclaration;
    };
    NodeConstraint: {
      return: dom.Type;
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
          "Cannot handle ShapeOr, ShapeAnd, ShapeNot, ShapeExternal, or NodeConstraint",
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
          dom.create.namedTypeReference("ContextDefinition"),
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
        newInterface.baseTypes = [];
        transformedChildren.extends.forEach((extendsItem) => {
          if ((extendsItem as dom.InterfaceDeclaration).kind === "interface") {
            newInterface.baseTypes?.push(
              extendsItem as dom.InterfaceDeclaration,
            );
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
      const eachOfComment = commentFromAnnotations(eachOf.annotations);
      setReturnPointer(objectType);
      // Get Input property expressions
      const inputPropertyExpressions: dom.PropertyDeclaration[] = [];
      transformedChildren.expressions
        .filter(
          (
            expression,
          ): expression is dom.ObjectType | dom.PropertyDeclaration => {
            return (
              (expression as dom.PropertyDeclaration).kind === "property" ||
              (expression as dom.ObjectType).kind === "object" ||
              (expression as dom.InterfaceDeclaration).kind === "interface"
            );
          },
        )
        .forEach(
          (
            expression:
              | dom.ObjectType
              | dom.InterfaceDeclaration
              | dom.PropertyDeclaration,
          ) => {
            if (expression.kind === "property") {
              inputPropertyExpressions.push(expression);
            } else {
              expression.members.forEach((objectMember) => {
                if (objectMember.kind === "property") {
                  inputPropertyExpressions.push(objectMember);
                }
              });
            }
          },
        );

      // Merge property expressions
      const properties: Record<string, dom.PropertyDeclaration> = {};
      inputPropertyExpressions.forEach((expression) => {
        const propertyDeclaration = expression as dom.PropertyDeclaration;
        // Combine properties if they're duplicates
        if (properties[propertyDeclaration.name]) {
          const oldPropertyDeclaration = properties[propertyDeclaration.name];
          const oldPropertyTypeAsArray =
            oldPropertyDeclaration.type as dom.ArrayTypeReference;
          const oldProeprtyType =
            oldPropertyTypeAsArray.kind === "array"
              ? oldPropertyTypeAsArray.type
              : oldPropertyDeclaration.type;
          const propertyTypeAsArray =
            propertyDeclaration.type as dom.ArrayTypeReference;
          const propertyType =
            propertyTypeAsArray.kind === "array"
              ? propertyTypeAsArray.type
              : propertyDeclaration.type;
          const isOptional =
            propertyDeclaration.flags === dom.DeclarationFlags.Optional ||
            oldPropertyDeclaration.flags === dom.DeclarationFlags.Optional;
          properties[propertyDeclaration.name] = dom.create.property(
            propertyDeclaration.name,
            dom.type.array(dom.create.union([oldProeprtyType, propertyType])),
            isOptional
              ? dom.DeclarationFlags.Optional
              : dom.DeclarationFlags.None,
          );
          // Set JS Comment
          properties[propertyDeclaration.name].jsDocComment =
            oldPropertyDeclaration.jsDocComment &&
            propertyDeclaration.jsDocComment
              ? `${oldPropertyDeclaration.jsDocComment} | ${propertyDeclaration.jsDocComment}`
              : oldPropertyDeclaration.jsDocComment ||
                propertyDeclaration.jsDocComment ||
                eachOfComment;
        } else {
          properties[propertyDeclaration.name] = propertyDeclaration;
        }
      });
      objectType.members.push(...Object.values(properties));
      return objectType;
    },
  },
  TripleConstraint: {
    transformer: async (
      tripleConstraint,
      getTransformedChildren,
      setReturnPointer,
      context,
    ) => {
      const transformedChildren = await getTransformedChildren();
      const propertyName = context.getNameFromIri(tripleConstraint.predicate);
      const isArray =
        tripleConstraint.max !== undefined && tripleConstraint.max !== 1;
      const isOptional = tripleConstraint.min === 0;
      let type: dom.Type = dom.type.any;
      if (transformedChildren.valueExpr) {
        type = transformedChildren.valueExpr as dom.Type;
      }

      const propertyDeclaration = dom.create.property(
        propertyName,
        isArray ? dom.type.array(type) : type,
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
      context,
    ) => {
      if (nodeConstraint.datatype) {
        switch (nodeConstraint.datatype) {
          case "http://www.w3.org/2001/XMLSchema#string":
          case "http://www.w3.org/2001/XMLSchema#ENTITIES":
          case "http://www.w3.org/2001/XMLSchema#ENTITY":
          case "http://www.w3.org/2001/XMLSchema#ID":
          case "http://www.w3.org/2001/XMLSchema#IDREF":
          case "http://www.w3.org/2001/XMLSchema#IDREFS":
          case "http://www.w3.org/2001/XMLSchema#language":
          case "http://www.w3.org/2001/XMLSchema#Name":
          case "http://www.w3.org/2001/XMLSchema#NCName":
          case "http://www.w3.org/2001/XMLSchema#NMTOKEN":
          case "http://www.w3.org/2001/XMLSchema#NMTOKENS":
          case "http://www.w3.org/2001/XMLSchema#normalizedString":
          case "http://www.w3.org/2001/XMLSchema#QName":
          case "http://www.w3.org/2001/XMLSchema#token":
            return dom.type.string;
          case "http://www.w3.org/2001/XMLSchema#date":
          case "http://www.w3.org/2001/XMLSchema#dateTime":
          case "http://www.w3.org/2001/XMLSchema#duration":
          case "http://www.w3.org/2001/XMLSchema#gDay":
          case "http://www.w3.org/2001/XMLSchema#gMonth":
          case "http://www.w3.org/2001/XMLSchema#gMonthDay":
          case "http://www.w3.org/2001/XMLSchema#gYear":
          case "http://www.w3.org/2001/XMLSchema#gYearMonth":
          case "http://www.w3.org/2001/XMLSchema#time":
            return dom.type.string;
          case "http://www.w3.org/2001/XMLSchema#byte":
          case "http://www.w3.org/2001/XMLSchema#decimal":
          case "http://www.w3.org/2001/XMLSchema#int":
          case "http://www.w3.org/2001/XMLSchema#integer":
          case "http://www.w3.org/2001/XMLSchema#long":
          case "http://www.w3.org/2001/XMLSchema#negativeInteger":
          case "http://www.w3.org/2001/XMLSchema#nonNegativeInteger":
          case "http://www.w3.org/2001/XMLSchema#nonPositiveInteger":
          case "http://www.w3.org/2001/XMLSchema#positiveInteger":
          case "http://www.w3.org/2001/XMLSchema#short":
          case "http://www.w3.org/2001/XMLSchema#unsignedLong":
          case "http://www.w3.org/2001/XMLSchema#unsignedInt":
          case "http://www.w3.org/2001/XMLSchema#unsignedShort":
          case "http://www.w3.org/2001/XMLSchema#unsignedByte":
            return dom.type.number;
          case "http://www.w3.org/2001/XMLSchema#boolean":
            return dom.type.boolean;
          case "http://www.w3.org/2001/XMLSchema#hexBinary":
            return dom.type.string;
          case "http://www.w3.org/2001/XMLSchema#anyURI":
            return dom.type.string;
          default:
            return dom.type.string;
        }
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
        const valuesUnion = dom.create.union([]);
        nodeConstraint.values.forEach((value) => {
          if (typeof value === "string") {
            valuesUnion.members.push(
              dom.create.objectType([
                dom.create.property(
                  "@id",
                  dom.type.stringLiteral(context.getNameFromIri(value)),
                ),
              ]),
            );
          }
        });
        return valuesUnion;
      }
      return dom.type.undefined;
    },
  },
});
