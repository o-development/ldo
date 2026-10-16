import { createBrowserSolidVueComposables } from "./createBrowserSolidVueComposables";

export const {
  provideSolidLdo,
  provideDataset,
  provideSolidAuth,
  useSolidAuth,
  useDataset,
  useLdo,
  useResource,
  useSubject,
  useMatchObject,
  useMatchSubject,
  useSubscribeToResource,
  useLinkQuery,
  useChangeDataset,
  useChangeSubject,
  useChangeMatchObject,
  useChangeMatchSubject,
} = createBrowserSolidVueComposables();
