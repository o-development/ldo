import type { Dataset } from "@rdfjs/types";
import type { ObjectNode } from "@ldo/rdf-utils";
import type { ArrayProxyTarget } from "./createArrayHandler";
import type {
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
  readonly [_getNodeAtIndex]: (index: number) => ObjectNode | undefined;
  readonly [_getUnderlyingArrayTarget]: ArrayProxyTarget;
  [_proxyContext]: ProxyContext;
};
