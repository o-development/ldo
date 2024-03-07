import { defaultGraph } from "@rdfjs/data-model";
import type { Dataset } from "@rdfjs/types";
import type { ContextDefinition } from "jsonld";
import { ContextUtil } from "./ContextUtil";
import { JsonldDatasetProxyBuilder } from "./JsonldDatasetProxyBuilder";
import { ProxyContext } from "./ProxyContext";
import type { LdoJsonldContext } from "./LdoJsonldContext";

/**
 * Creates a JSON-LD Dataset Proxy
 *
 * @param inputDataset the source dataset
 * @param context JSON-LD Context
 * @returns a JSON-LD Dataset proxy
 */
export function jsonldDatasetProxy(
  inputDataset: Dataset,
  context: ContextDefinition | LdoJsonldContext,
): JsonldDatasetProxyBuilder {
  const contextUtil = new ContextUtil(context);
  const proxyContext = new ProxyContext({
    dataset: inputDataset,
    contextUtil,
    writeGraphs: [defaultGraph()],
    languageOrdering: ["none", "en", "other"],
  });
  return new JsonldDatasetProxyBuilder(proxyContext);
}
