import {
  _getNodeAtIndex,
  _getUnderlyingArrayTarget,
  _getUnderlyingDataset,
  _getUnderlyingMatch,
  _getUnderlyingNode,
  _proxyContext,
  _writeGraphs,
} from "../types";
import type { ArrayProxy } from "./ArrayProxy";

export function isArrayProxy(someObject?: unknown): someObject is ArrayProxy {
  if (!someObject) return false;
  if (typeof someObject !== "object") return false;
  const potentialArrayProxy = someObject as ArrayProxy;

  return !(
    typeof potentialArrayProxy[_getUnderlyingDataset] !== "object" ||
    typeof potentialArrayProxy[_getUnderlyingMatch] !== "object" ||
    typeof potentialArrayProxy[_getNodeAtIndex] !== "function" ||
    typeof potentialArrayProxy[_getUnderlyingArrayTarget] !== "object"
  );
}
