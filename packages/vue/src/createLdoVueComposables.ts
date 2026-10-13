import {
  type ConnectedLdoDataset,
  createConnectedLdoDataset,
  type ConnectedPlugin,
} from "@ldo/connected";
import { inject, provide, type InjectionKey } from "vue";
import { createUseSubject } from "./methods/useSubject";
import { createUseMatchObject } from "./methods/useMatchObject";
import { createUseResource } from "./methods/useResource";
import { createUseMatchSubject } from "./methods/useMatchSubject";
import { createUseDataset } from "./methods/useDataset";
import { createUseLdo } from "./methods/useLdo";
import { createUseSubscribeToResource } from "./methods/useSubscribeToResource";
import { createUseLinkQuery } from "./methods/useLinkQuery";
import { createUseChangeDataset } from "./methods/change/useChangeDataset";
import { createUseChangeMatchObject } from "./methods/change/useChangeMatchObject";
import { createUseChangeMatchSubject } from "./methods/change/useChangeMatchSubject";

/**
 * Create ldo composables for Vue, where the dataset is isolated and provided/injected.
 *
 * You have to run `provideDataset()` in the ancestor component to set up the dataset.
 *
 * @example
 * ```ts
 * // in ldoComposables.ts do
 *
 * export const { provideDataset, useDataset, useSubject, ...etc } = createLdoVueComposables(connectedPlugins);
 * export { provideDataset, useDataset }
 *
 * // provide dataset in parent component
 * provideDataset()
 *
 * // use composables in child component
 * const subjectLdo = useSubject(...subjectProps)
 * ```
 */
export function createLdoVueComposables<Plugin extends ConnectedPlugin>(
  plugins: Plugin[],
) {
  const DatasetKey: InjectionKey<ConnectedLdoDataset<Plugin[]>> =
    Symbol("Dataset Key");

  function provideDataset() {
    const dataset = createConnectedLdoDataset(plugins);
    provide(DatasetKey, dataset);
    return dataset;
  }

  return {
    provideDataset,
    useDataset: createComposable(DatasetKey, createUseDataset<Plugin[]>),
    useLdo: createComposable(DatasetKey, createUseLdo<Plugin[]>),
    useResource: createComposable(DatasetKey, createUseResource<Plugin[]>),
    useSubject: createComposable(DatasetKey, createUseSubject<Plugin[]>),
    useMatchObject: createComposable(
      DatasetKey,
      createUseMatchObject<Plugin[]>,
    ),
    useMatchSubject: createComposable(
      DatasetKey,
      createUseMatchSubject<Plugin[]>,
    ),
    useSubscribeToResource: createComposable(
      DatasetKey,
      createUseSubscribeToResource<Plugin[]>,
    ),
    useLinkQuery: createComposable(DatasetKey, createUseLinkQuery<Plugin[]>),
    useChangeDataset: createComposable(
      DatasetKey,
      createUseChangeDataset<Plugin[]>,
    ),
    useChangeSubject: createComposable(DatasetKey, createUseSubject<Plugin[]>),
    useChangeMatchObject: createComposable(
      DatasetKey,
      createUseChangeMatchObject<Plugin[]>,
    ),
    useChangeMatchSubject: createComposable(
      DatasetKey,
      createUseChangeMatchSubject<Plugin[]>,
    ),
  };
}

/**
 * @internal
 *
 * A method to create the composable with injected dataset
 */
const createComposable = <
  Plugin extends ConnectedPlugin,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CreateComposable extends (dataset: ConnectedLdoDataset<Plugin[]>) => any,
>(
  key: InjectionKey<ConnectedLdoDataset<Plugin[]>>,
  creator: CreateComposable,
): ReturnType<CreateComposable> => {
  // We return a proxy function matching the exact signature layout of the underlying contract
  return function wrappedMethod(
    ...props: Parameters<ReturnType<CreateComposable>>
  ): ReturnType<ReturnType<CreateComposable>> {
    // inject the dataset
    const dataset = inject(key);
    // check that it's actually provided
    if (!dataset)
      throw new Error(
        "Composable must have a dataset provider. Please call provideDataset() in a parent component.",
      );

    // Create and run the composable with the injected dataset
    return creator(dataset)(...props);
  } as ReturnType<CreateComposable>;
};
