import { shapeExpr, valueSetValue } from "shexj";
import { ShexJTraverserTypes } from "./ShexJTraverserTypes";
import { TraverserDefinition } from "../../../lib";

export const ShexJTraverserDefinition: TraverserDefinition<ShexJTraverserTypes> =
  {
    Schema: {
      kind: "interface",
      properties: {
        startActs: "SemAct",
        start: "shapeExpr",
        imports: "IRIREF",
        shapes: "shapeExpr",
      },
    },
    shapeExpr: {
      kind: "union",
      selector: (item: shapeExpr) => {
        if (typeof item === "string") {
          return "shapeExprRef";
        }
        return item.type;
      },
    },
    ShapeOr: {
      kind: "interface",
      properties: {
        id: "shapeExprRef",
        shapeExprs: "shapeExpr",
      },
    },
    ShapeAnd: {
      kind: "interface",
      properties: {
        id: "shapeExprRef",
        shapeExprs: "shapeExpr",
      },
    },
    ShapeNot: {
      kind: "interface",
      properties: {
        id: "shapeExprRef",
        shapeExpr: "shapeExpr",
      },
    },
    ShapeExternal: {
      kind: "interface",
      properties: {
        id: "shapeExprRef",
      },
    },
    shapeExprRef: {
      kind: "primitive",
    },
    NodeConstraint: {
      kind: "interface",
      properties: {
        id: "shapeExprRef",
        datatype: "IRIREF",
        values: "valueSetValue",
        length: "INTEGER",
        minlength: "INTEGER",
        maxlength: "INTEGER",
        pattern: "STRING",
        flags: "STRING",
        mininclusive: "numericLiteral",
        minexclusive: "numericLiteral",
        maxinclusive: "numericLiteral",
        maxexclusive: "numericLiteral",
        totaldigits: "INTEGER",
        fractiondigits: "INTEGER",
      },
    },
    numericLiteral: {
      kind: "primitive",
    },
    valueSetValue: {
      kind: "union",
      selector: (item: valueSetValue) => {
        if (typeof item === "string") {
          return "objectValue";
        } else if (
          item.type &&
          [
            "IriStem",
            "IriStemRange",
            "LiteralStem",
            "LiteralStemRange",
            "Language",
            "LanguageStem",
            "LanguageStemRange",
          ].includes(item.type)
        ) {
          return item.type as
            | "IriStem"
            | "IriStemRange"
            | "LiteralStem"
            | "LiteralStemRange"
            | "Language"
            | "LanguageStem"
            | "LanguageStemRange";
        } else {
          return "objectValue";
        }
      },
    },
    objectValue: {
      kind: "union",
      selector: (item) => {
        return typeof item === "string" ? "IRIREF" : "ObjectLiteral";
      },
    },
    ObjectLiteral: {
      kind: "interface",
      properties: {
        value: "STRING",
        language: "STRING",
        type: "STRING",
      },
    },
    IriStem: {
      kind: "interface",
      properties: {
        stem: "IRIREF",
      },
    },
    IriStemRange: {
      kind: "interface",
      properties: {
        stem: "IriStemRangeStem",
        exclusions: "IriStemRangeExclusions",
      },
    },
    IriStemRangeStem: {
      kind: "union",
      selector: (item) => {
        return typeof item === "string" ? "IRIREF" : "Wildcard";
      },
    },
    IriStemRangeExclusions: {
      kind: "union",
      selector: (item) => {
        return typeof item === "string" ? "IRIREF" : "IriStem";
      },
    },
    LiteralStem: {
      kind: "interface",
      properties: {
        stem: "STRING",
      },
    },
    LiteralStemRange: {
      kind: "interface",
      properties: {
        stem: "LiteralStemRangeStem",
        exclusions: "LiteralStemRangeExclusions",
      },
    },
    LiteralStemRangeStem: {
      kind: "union",
      selector: (item) => {
        return typeof item === "string" ? "STRING" : "Wildcard";
      },
    },
    LiteralStemRangeExclusions: {
      kind: "union",
      selector: (item) => {
        return typeof item === "string" ? "STRING" : "LiteralStem";
      },
    },
    Language: {
      kind: "interface",
      properties: {
        languageTag: "LANGTAG",
      },
    },
    LanguageStem: {
      kind: "interface",
      properties: {
        stem: "LANGTAG",
      },
    },
    LanguageStemRange: {
      kind: "interface",
      properties: {
        stem: "LanguageStemRangeStem",
        exclusions: "LanguageStemRangeExclusions",
      },
    },
    LanguageStemRangeStem: {
      kind: "union",
      selector: (item) => {
        return typeof item === "string" ? "LANGTAG" : "Wildcard";
      },
    },
    LanguageStemRangeExclusions: {
      kind: "union",
      selector: (item) => {
        return typeof item === "string" ? "LANGTAG" : "LanguageStem";
      },
    },
    Wildcard: {
      kind: "interface",
      properties: {},
    },
    Shape: {
      kind: "interface",
      properties: {
        id: "shapeExprRef",
        closed: "BOOL",
        extra: "IRIREF",
        expression: "tripleExpr",
        semActs: "SemAct",
        annotations: "Annotation",
      },
    },
    tripleExpr: {
      kind: "union",
      selector: (item) => {
        if (typeof item === "string") {
          return "tripleExprRef";
        }
        return item.type;
      },
    },
    EachOf: {
      kind: "interface",
      properties: {
        expressions: "tripleExpr",
        id: "shapeExprRef",
        min: "INTEGER",
        max: "INTEGER",
        semActs: "SemAct",
        annotations: "Annotation",
      },
    },
    OneOf: {
      kind: "interface",
      properties: {
        expressions: "tripleExpr",
        id: "shapeExprRef",
        min: "INTEGER",
        max: "INTEGER",
        semActs: "SemAct",
        annotations: "Annotation",
      },
    },
    TripleConstraint: {
      kind: "interface",
      properties: {
        inverse: "BOOL",
        predicate: "IRIREF",
        valueExpr: "shapeExpr",
        id: "shapeExprRef",
        min: "INTEGER",
        max: "INTEGER",
        semActs: "SemAct",
        annotations: "Annotation",
      },
    },
    tripleExprRef: {
      kind: "primitive",
    },
    SemAct: {
      kind: "interface",
      properties: {
        name: "IRIREF",
        code: "STRING",
      },
    },
    Annotation: {
      kind: "interface",
      properties: {
        predicate: "IRI",
        object: "objectValue",
      },
    },
    IRIREF: {
      kind: "primitive",
    },
    STRING: {
      kind: "primitive",
    },
    LANGTAG: {
      kind: "primitive",
    },
    INTEGER: {
      kind: "primitive",
    },
    BOOL: {
      kind: "primitive",
    },
    IRI: {
      kind: "primitive",
    },
  };
