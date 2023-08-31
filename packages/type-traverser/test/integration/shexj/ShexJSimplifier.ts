/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShexJTraverser } from "./ShexJTraverser";

interface ShapeReturn {
  id: any;
  closed: any;
  extra: any[];
  expression: any;
  semActs: any[];
  annotations: any[];
}

export const ShexJStringTransformer = ShexJTraverser.createTransformer({
  Shape: {
    transformer: async (
      shape,
      getTransformedChildren,
      setReturnPointer
    ): Promise<ShapeReturn> => {
      const toReturn: Partial<{
        id: any;
        closed: any;
        extra: any[];
        expression: any;
        semActs: any[];
        annotations: any[];
      }> = {};
      setReturnPointer(toReturn as ShapeReturn);
      const transformedChildren = await getTransformedChildren();
      toReturn.id = transformedChildren.id;
      toReturn.annotations = transformedChildren.annotations;
      toReturn.extra = transformedChildren.extra;
      toReturn.expression = transformedChildren.expression;
      toReturn.semActs = transformedChildren.semActs;
      toReturn.annotations = transformedChildren.annotations;
      return toReturn as ShapeReturn;
    },
  },
});
