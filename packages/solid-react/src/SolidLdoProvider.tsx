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
import type { LdoBase, ShapeType } from "@ldo/ldo";
import type { SubjectNode } from "@ldo/rdf-utils";

export const SolidLdoReactContext =
  // This will be set in the provider
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createContext<UseLdoResult>(undefined);

export interface UseLdoResult {
  dataset: SolidLdoDataset;
  getResource: SolidLdoDataset["getResource"];
  getSubject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
  ): Type | Error;
}

export function useLdo(): UseLdoResult {
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
    return ldoDataset;
  }, []);

  // Keep context in sync with props
  useEffect(() => {
    solidLdoDataset.context.fetch = fetch;
  }, [fetch]);

  const value: UseLdoResult = useMemo(
    () => ({
      dataset: solidLdoDataset,
      getResource: solidLdoDataset.getResource.bind(solidLdoDataset),
      getSubject<Type extends LdoBase>(
        shapeType: ShapeType<Type>,
        subject: string | SubjectNode,
      ): Type | Error {
        return solidLdoDataset.usingType(shapeType).fromSubject(subject);
      },
    }),
    [solidLdoDataset],
  );

  return (
    <SolidLdoReactContext.Provider value={value}>
      {children}
    </SolidLdoReactContext.Provider>
  );
};
