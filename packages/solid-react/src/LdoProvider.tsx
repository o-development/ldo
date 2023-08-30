import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useMemo,
} from "react";
import crossFetch from "cross-fetch";
import { createLdoDataset } from "ldo";
import { LdoContextData, LdoContextProvider } from "./LdoContext";
import { UpdateManager } from "./ldoHooks/helpers/UpdateManager";
import { BinaryResourceStore } from "./document/resource/binaryResource/BinaryResourceStore";
import { DataResourceStore } from "./document/resource/dataResource/DataResourceStore";
import { ContainerResourceStore } from "./document/resource/dataResource/containerResource/ContainerResourceStore";
import { AccessRulesStore } from "./document/accessRules/AccessRulesStore";
import { Dataset } from "@rdfjs/types";

export interface LdoProviderProps extends PropsWithChildren {
  fetch?: typeof fetch;
  dataset?: Dataset;
  onDocumentError?: LdoContextData["onDocumentError"];
}

/**
 * Main Ldo Provider
 */
export const LdoProvider: FunctionComponent<
  PropsWithChildren<LdoProviderProps>
> = ({ dataset, fetch, onDocumentError, children }) => {
  const finalFetch = useMemo(() => fetch || crossFetch, [fetch]);
  const ldoDataset = useMemo(() => createLdoDataset(dataset), [dataset]);

  // Initialize storeDependencies before render
  const storeDependencies = useMemo(() => {
    // Ingnoring this because we're setting up circular dependencies
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const dependencies: LdoContextData = {
      onDocumentError,
      fetch: finalFetch,
      dataset: ldoDataset,
      updateManager: new UpdateManager(),
    };
    const binaryResourceStore = new BinaryResourceStore(dependencies);
    const dataResourceStore = new DataResourceStore(dependencies);
    const containerResourceStore = new ContainerResourceStore(dependencies);
    const accessRulesStore = new AccessRulesStore(dependencies);
    dependencies.binaryResourceStore = binaryResourceStore;
    dependencies.dataResourceStore = dataResourceStore;
    dependencies.containerResourceStore = containerResourceStore;
    dependencies.accessRulesStore = accessRulesStore;
    return dependencies;
  }, []);

  // Update the resource manager in case fetch or ldo dataset changes
  useEffect(() => {
    storeDependencies.fetch = finalFetch;
    storeDependencies.dataset = ldoDataset;
    storeDependencies.onDocumentError = onDocumentError;
  }, [finalFetch, ldoDataset, onDocumentError]);

  return (
    <LdoContextProvider value={storeDependencies}>
      {children}
    </LdoContextProvider>
  );
};
