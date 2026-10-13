import { createBrowserSolidVueComposables } from "./createBrowserSolidVueMethods";

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
