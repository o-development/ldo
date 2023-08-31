import type { Dataset } from "@rdfjs/types";
import type { ArrayProxyTarget } from "./createArrayHandler";
import type {
  ObjectType,
  _getNodeAtIndex,
  _getUnderlyingArrayTarget,
  _getUnderlyingDataset,
  _getUnderlyingMatch,
  _proxyContext,
} from "../types";
import { _getUnderlyingNode } from "../types";
import type { ProxyContext } from "../ProxyContext";

export type ArrayProxy = Array<unknown> & {
  readonly [_getUnderlyingDataset]: Dataset;
  readonly [_getUnderlyingMatch]: ArrayProxyTarget[0];
  readonly [_getNodeAtIndex]: (index: number) => ObjectType | undefined;
  readonly [_getUnderlyingArrayTarget]: ArrayProxyTarget;
  [_proxyContext]: ProxyContext;
};
