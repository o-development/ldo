import React, { createContext, useContext } from "react";
import {
  useMemo,
  type FunctionComponent,
  type PropsWithChildren,
  useRef,
  useEffect,
} from "react";
import { useSolidAuth } from "./SolidAuthContext";
import type { SolidLdoDataset, OnDocumentErrorCallback } from "@ldo/solid";
import { createSolidLdoDataset } from "@ldo/solid";

export const SolidLdoDatasetReactContext =
  // This will be set in the provider
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createContext<SolidLdoDataset>(undefined);

export function useSolidLdoDataset() {
  return useContext(SolidLdoDatasetReactContext);
}

export interface SolidLdoProviderProps extends PropsWithChildren {
  onDocumentError?: OnDocumentErrorCallback;
}

export const SolidLdoProvider: FunctionComponent<SolidLdoProviderProps> = ({
  onDocumentError,
  children,
}) => {
  const { fetch } = useSolidAuth();
  const curOnDocumentError = useRef(onDocumentError);

  // Initialize storeDependencies before render
  const solidLdoDataset = useMemo(() => {
    const ldoDataset = createSolidLdoDataset({
      fetch,
    });
    if (curOnDocumentError.current) {
      ldoDataset.onDocumentError(curOnDocumentError.current);
    }
    return ldoDataset;
  }, []);

  // Keep context in sync with props
  useEffect(() => {
    solidLdoDataset.context.fetch = fetch;
  }, [fetch]);
  useEffect(() => {
    if (curOnDocumentError.current) {
      solidLdoDataset.offDocumentError(curOnDocumentError.current);
    }
    if (onDocumentError) {
      solidLdoDataset.onDocumentError(onDocumentError);
      curOnDocumentError.current = onDocumentError;
    } else {
      curOnDocumentError.current = undefined;
    }
  }, [onDocumentError]);

  return (
    <SolidLdoDatasetReactContext.Provider value={solidLdoDataset}>
      {children}
    </SolidLdoDatasetReactContext.Provider>
  );
};
