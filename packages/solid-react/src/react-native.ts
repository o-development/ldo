import { solidConnectedPlugin } from "@ldo/connected-solid";
import { createLdoReactMethods, createUseResource } from "@ldo/react";
import { createUseRootContainerFor } from "./useRootContainerFor";

export * from "./SolidAuthContext";
export * from "./UnauthenticatedSolidLdoProvider";

const {
  dataset,
  useDataset,
  useLdo,
  useMatchObject,
  useMatchSubject,
  useResource,
  useSubject,
  useSubscribeToResource,
  useLinkQuery,
  useChangeDataset,
  useChangeSubject,
  useChangeMatchObject,
  useChangeMatchSubject,
} = createLdoReactMethods([solidConnectedPlugin]);

export {
  dataset,
  useDataset,
  useLdo,
  useMatchObject,
  useMatchSubject,
  useResource,
  useSubject,
  useSubscribeToResource,
  useLinkQuery,
  useChangeDataset,
  useChangeSubject,
  useChangeMatchObject,
  useChangeMatchSubject,
};

export const useRootContainerFor = createUseRootContainerFor(
  dataset,
  createUseResource(dataset),
);
