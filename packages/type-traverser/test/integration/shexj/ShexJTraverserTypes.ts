import {
  Annotation,
  EachOf,
  IriStem,
  Language,
  LanguageStem,
  LanguageStemRange,
  LiteralStem,
  LiteralStemRange,
  NodeConstraint,
  ObjectLiteral,
  OneOf,
  Schema,
  SemAct,
  Shape,
  ShapeAnd,
  ShapeExternal,
  ShapeNot,
  ShapeOr,
  Wildcard,
  shapeExpr,
  valueSetValue,
  tripleExpr,
  TripleConstraint,
  shapeExprRef,
  IRIREF,
  STRING,
  LANGTAG,
  INTEGER,
  numericLiteral,
  BOOL,
  tripleExprRef,
  IRI,
  objectValue,
} from "shexj";
import { ValidateTraverserTypes } from "../../../lib";

export type ShexJTraverserTypes = ValidateTraverserTypes<{
  Schema: {
    kind: "interface";
    type: Schema;
    properties: {
      startActs: "SemAct";
      start: "shapeExpr";
      imports: "IRIREF";
      shapes: "shapeExpr";
    };
  };
  shapeExpr: {
    kind: "union";
    type: shapeExpr;
    typeNames:
      | "ShapeOr"
      | "ShapeAnd"
      | "ShapeNot"
      | "NodeConstraint"
      | "Shape"
      | "ShapeExternal"
      | "shapeExprRef";
  };
  ShapeOr: {
    kind: "interface";
    type: ShapeOr;
    properties: {
      id: "shapeExprRef";
      shapeExprs: "shapeExpr";
    };
  };
  ShapeAnd: {
    kind: "interface";
    type: ShapeAnd;
    properties: {
      id: "shapeExprRef";
      shapeExprs: "shapeExpr";
    };
  };
  ShapeNot: {
    kind: "interface";
    type: ShapeNot;
    properties: {
      id: "shapeExprRef";
      shapeExpr: "shapeExpr";
    };
  };
  ShapeExternal: {
    kind: "interface";
    type: ShapeExternal;
    properties: {
      id: "shapeExprRef";
    };
  };
  shapeExprRef: {
    kind: "primitive";
    type: shapeExprRef;
  };
  NodeConstraint: {
    kind: "interface";
    type: NodeConstraint;
    properties: {
      id: "shapeExprRef";
      datatype: "IRIREF";
      values: "valueSetValue";
      length: "INTEGER";
      minlength: "INTEGER";
      maxlength: "INTEGER";
      pattern: "STRING";
      flags: "STRING";
      mininclusive: "numericLiteral";
      minexclusive: "numericLiteral";
      maxinclusive: "numericLiteral";
      maxexclusive: "numericLiteral";
      totaldigits: "INTEGER";
      fractiondigits: "INTEGER";
    };
  };
  numericLiteral: {
    kind: "primitive";
    type: numericLiteral;
  };
  valueSetValue: {
    kind: "union";
    type: valueSetValue;
    typeNames:
      | "objectValue"
      | "IriStem"
      | "IriStemRange"
      | "LiteralStem"
      | "LiteralStemRange"
      | "Language"
      | "LanguageStem"
      | "LanguageStemRange";
  };
  objectValue: {
    kind: "union";
    type: objectValue;
    typeNames: "IRIREF" | "ObjectLiteral";
  };
  ObjectLiteral: {
    kind: "interface";
    type: ObjectLiteral;
    properties: {
      value: "STRING";
      language: "STRING";
      type: "STRING";
    };
  };
  IriStem: {
    kind: "interface";
    type: IriStem;
    properties: {
      stem: "IRIREF";
    };
  };
  IriStemRange: {
    kind: "interface";
    type: IriStem;
    properties: {
      stem: "IriStemRangeStem";
      exclusions: "IriStemRangeExclusions";
    };
  };
  IriStemRangeStem: {
    kind: "union";
    type: IRIREF | Wildcard;
    typeNames: "IRIREF" | "Wildcard";
  };
  IriStemRangeExclusions: {
    kind: "union";
    type: IRIREF | IriStem;
    typeNames: "IRIREF" | "IriStem";
  };
  LiteralStem: {
    kind: "interface";
    type: LiteralStem;
    properties: {
      stem: "STRING";
    };
  };
  LiteralStemRange: {
    kind: "interface";
    type: LiteralStemRange;
    properties: {
      stem: "LiteralStemRangeStem";
      exclusions: "LiteralStemRangeExclusions";
    };
  };
  LiteralStemRangeStem: {
    kind: "union";
    type: STRING | Wildcard;
    typeNames: "STRING" | "Wildcard";
  };
  LiteralStemRangeExclusions: {
    kind: "union";
    type: STRING | LiteralStem;
    typeNames: "STRING" | "LiteralStem";
  };
  Language: {
    kind: "interface";
    type: Language;
    properties: {
      languageTag: "LANGTAG";
    };
  };
  LanguageStem: {
    kind: "interface";
    type: LanguageStem;
    properties: {
      stem: "LANGTAG";
    };
  };
  LanguageStemRange: {
    kind: "interface";
    type: LanguageStemRange;
    properties: {
      stem: "LanguageStemRangeStem";
      exclusions: "LanguageStemRangeExclusions";
    };
  };
  LanguageStemRangeStem: {
    kind: "union";
    type: LANGTAG | Wildcard;
    typeNames: "LANGTAG" | "Wildcard";
  };
  LanguageStemRangeExclusions: {
    kind: "union";
    type: LANGTAG | LanguageStem;
    typeNames: "LANGTAG" | "LanguageStem";
  };
  Wildcard: {
    kind: "interface";
    type: Wildcard;
    properties: Record<string, never>;
  };
  Shape: {
    kind: "interface";
    type: Shape;
    properties: {
      id: "shapeExprRef";
      closed: "BOOL";
      extra: "IRIREF";
      expression: "tripleExpr";
      semActs: "SemAct";
      annotations: "Annotation";
    };
  };
  tripleExpr: {
    kind: "union";
    type: tripleExpr;
    typeNames: "tripleExprRef" | "EachOf" | "OneOf" | "TripleConstraint";
  };
  EachOf: {
    kind: "interface";
    type: EachOf;
    properties: {
      expressions: "tripleExpr";
      id: "shapeExprRef";
      min: "INTEGER";
      max: "INTEGER";
      semActs: "SemAct";
      annotations: "Annotation";
    };
  };
  OneOf: {
    kind: "interface";
    type: OneOf;
    properties: {
      expressions: "tripleExpr";
      id: "shapeExprRef";
      min: "INTEGER";
      max: "INTEGER";
      semActs: "SemAct";
      annotations: "Annotation";
    };
  };
  TripleConstraint: {
    kind: "interface";
    type: TripleConstraint;
    properties: {
      inverse: "BOOL";
      predicate: "IRIREF";
      valueExpr: "shapeExpr";
      id: "shapeExprRef";
      min: "INTEGER";
      max: "INTEGER";
      semActs: "SemAct";
      annotations: "Annotation";
    };
  };
  tripleExprRef: {
    kind: "primitive";
    type: tripleExprRef;
  };
  SemAct: {
    kind: "interface";
    type: SemAct;
    properties: {
      name: "IRIREF";
      code: "STRING";
    };
  };
  Annotation: {
    kind: "interface";
    type: Annotation;
    properties: {
      predicate: "IRI";
      object: "objectValue";
    };
  };
  IRIREF: {
    kind: "primitive";
    type: IRIREF;
  };
  STRING: {
    kind: "primitive";
    type: STRING;
  };
  LANGTAG: {
    kind: "primitive";
    type: LANGTAG;
  };
  INTEGER: {
    kind: "primitive";
    type: INTEGER;
  };
  BOOL: {
    kind: "primitive";
    type: BOOL;
  };
  IRI: {
    kind: "primitive";
    type: IRI;
  };
}>;
