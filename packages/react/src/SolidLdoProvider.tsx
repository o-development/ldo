import React, { createContext, useContext } from "react";
import {
  useMemo,
  type FunctionComponent,
  type PropsWithChildren,
  useEffect,
} from "react";
import { useSolidAuth } from "./SolidAuthContext";
import type { SolidLdoDataset } from "@ldo/solid";
import { createSolidLdoDataset } from "@ldo/solid";
import type { UseLdoMethods } from "./useLdoMethods";
import { createUseLdoMethods } from "./useLdoMethods";

export const SolidLdoReactContext =
  // This will be set in the provider
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createContext<UseLdoMethods>(undefined);

export function useLdo(): UseLdoMethods {
  return useContext(SolidLdoReactContext);
}

export interface SolidLdoProviderProps extends PropsWithChildren {}

export const SolidLdoProvider: FunctionComponent<SolidLdoProviderProps> = ({
  children,
}) => {
  const { fetch } = useSolidAuth();

  // Initialize storeDependencies before render
  const solidLdoDataset: SolidLdoDataset = useMemo(() => {
    const ldoDataset = createSolidLdoDataset({
      fetch,
    });
    ldoDataset.setMaxListeners(1000);
    return ldoDataset;
  }, []);

  // Keep context in sync with props
  useEffect(() => {
    solidLdoDataset.context.fetch = fetch;
  }, [fetch]);

  const value: UseLdoMethods = useMemo(
    () => createUseLdoMethods(solidLdoDataset),
    [solidLdoDataset],
  );

  return (
    <SolidLdoReactContext.Provider value={value}>
      {children}
    </SolidLdoReactContext.Provider>
  );
};
