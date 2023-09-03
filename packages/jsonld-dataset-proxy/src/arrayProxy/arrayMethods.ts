import type { ArrayProxyTarget } from "./createArrayHandler";
import type { ObjectJsonRepresentation } from "../util/nodeToJsonldRepresentation";
import { nodeToJsonldRepresentation } from "../util/nodeToJsonldRepresentation";
import { modifyArray } from "./modifyArray";
import type { ProxyContext } from "../ProxyContext";

export type methodBuilder<Return> = (
  target: ArrayProxyTarget,
  key: string,
  proxyContext: ProxyContext,
) => Return;

export interface ArrayMethodBuildersType {
  copyWithin: methodBuilder<Array<ObjectJsonRepresentation>["copyWithin"]>;
  fill: methodBuilder<Array<ObjectJsonRepresentation>["fill"]>;
  pop: methodBuilder<Array<ObjectJsonRepresentation>["pop"]>;
  push: methodBuilder<Array<ObjectJsonRepresentation>["push"]>;
  reverse: methodBuilder<Array<ObjectJsonRepresentation>["reverse"]>;
  shift: methodBuilder<Array<ObjectJsonRepresentation>["shift"]>;
  sort: methodBuilder<Array<ObjectJsonRepresentation>["sort"]>;
  splice: methodBuilder<Array<ObjectJsonRepresentation>["splice"]>;
  unshift: methodBuilder<Array<ObjectJsonRepresentation>["unshift"]>;
}

export const methodNames: Set<keyof ArrayMethodBuildersType> = new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift",
]);

export const arrayMethodsBuilders: ArrayMethodBuildersType = {
  copyWithin: (target, key, proxyContext) => {
    return (targetIndex, start, end) => {
      return modifyArray(
        {
          target,
          key,
          quadsToDelete: (quads) => {
            const oldQuads = [...quads];
            const newQuadSet = new Set(
              quads.copyWithin(targetIndex, start, end),
            );
            return oldQuads.filter((oldQuad) => !newQuadSet.has(oldQuad));
          },
          modifyCoreArray: (coreArray) => {
            coreArray.copyWithin(targetIndex, start, end);
            return proxyContext.createArrayProxy(
              target[0],
              target[2],
            ) as ObjectJsonRepresentation[];
          },
        },
        proxyContext,
      );
    };
  },
  fill: (target, key, proxyContext) => {
    return (value, start, end) => {
      return modifyArray(
        {
          target,
          key,
          toAdd: [value],
          quadsToDelete: (quads) => {
            return quads.slice(start, end);
          },
          modifyCoreArray: (coreArray, addedValues) => {
            coreArray.fill(addedValues[0], start, end);
            return proxyContext.createArrayProxy(
              target[0],
              target[2],
            ) as ObjectJsonRepresentation[];
          },
        },
        proxyContext,
      );
    };
  },
  pop: (target, key, proxyContext) => {
    return () => {
      return modifyArray(
        {
          target,
          key,
          quadsToDelete: (quads) => {
            return quads[quads.length - 1] ? [quads[quads.length - 1]] : [];
          },
          modifyCoreArray: (coreArray) => {
            const popped = coreArray.pop();
            return popped
              ? nodeToJsonldRepresentation(popped, proxyContext)
              : undefined;
          },
        },
        proxyContext,
      );
    };
  },
  push: (target, key, proxyContext) => {
    return (...args) => {
      return modifyArray(
        {
          target,
          key,
          toAdd: args,
          modifyCoreArray: (coreArray, addedValues) => {
            coreArray.push(...addedValues);
            return proxyContext.createArrayProxy(target[0], target[2]).length;
          },
        },
        proxyContext,
      );
    };
  },
  reverse: (target, _key, proxyContext) => {
    return () => {
      target[1].reverse();
      return proxyContext.createArrayProxy(
        target[0],
        target[2],
      ) as ObjectJsonRepresentation[];
    };
  },
  shift: (target, key, proxyContext) => {
    return () => {
      return modifyArray(
        {
          target,
          key,
          quadsToDelete: (quads) => {
            return quads[0] ? [quads[0]] : [];
          },
          modifyCoreArray: (coreArray) => {
            const shifted = coreArray.shift();
            return shifted
              ? nodeToJsonldRepresentation(shifted, proxyContext)
              : undefined;
          },
        },
        proxyContext,
      );
    };
  },
  sort: (target, _key, proxyContext) => {
    return (compareFunction) => {
      if (compareFunction) {
        target[1].sort((a, b) => {
          return compareFunction(
            nodeToJsonldRepresentation(a, proxyContext),
            nodeToJsonldRepresentation(b, proxyContext),
          );
        });
      } else if (target) {
        target[1].sort((a, b) => {
          const aReal = nodeToJsonldRepresentation(a, proxyContext);
          const bReal = nodeToJsonldRepresentation(b, proxyContext);
          if (aReal > bReal) {
            return 1;
          } else if (bReal > aReal) {
            return -1;
          } else {
            return 0;
          }
        });
      }
      return proxyContext.createArrayProxy(
        target[0],
        target[2],
      ) as ObjectJsonRepresentation[];
    };
  },
  splice: (target, key, proxyContext) => {
    return (start, deleteCount, ...items: ObjectJsonRepresentation[]) => {
      return modifyArray(
        {
          target,
          key,
          toAdd: items,
          quadsToDelete: (quads) => {
            return quads.splice(start, deleteCount);
          },
          modifyCoreArray: (coreArray, addedValues) => {
            const spliced = coreArray.splice(
              start,
              deleteCount || 0,
              ...addedValues,
            );
            return spliced.map((node) => {
              return nodeToJsonldRepresentation(node, proxyContext);
            });
          },
        },
        proxyContext,
      );
    };
  },
  unshift: (target, key, proxyContext) => {
    return (...args) => {
      return modifyArray(
        {
          target,
          key,
          toAdd: args,
          modifyCoreArray: (coreArray, addedValues) => {
            coreArray.unshift(...addedValues);
            return proxyContext.createArrayProxy(target[0], target[2]).length;
          },
        },
        proxyContext,
      );
    };
  },
};
