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
import { createUseChangeSubject } from "./methods/change/useChangeSubject";

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
export function createLdoVueComposables<Plugins extends ConnectedPlugin[]>(
  plugins: Plugins,
) {
  const datasetInjectionKey: InjectionKey<ConnectedLdoDataset<Plugins>> =
    Symbol("Dataset Key");

  function provideDataset() {
    const dataset = createConnectedLdoDataset(plugins);
    provide(datasetInjectionKey, dataset);
    return dataset;
  }

  return {
    datasetInjectionKey,
    provideDataset,
    useDataset: createComposable(
      datasetInjectionKey,
      createUseDataset<Plugins>,
    ),
    useLdo: createComposable(datasetInjectionKey, createUseLdo<Plugins>),
    useResource: createComposable(
      datasetInjectionKey,
      createUseResource<Plugins>,
    ),
    useSubject: createComposable(
      datasetInjectionKey,
      createUseSubject<Plugins>,
    ),
    useMatchObject: createComposable(
      datasetInjectionKey,
      createUseMatchObject<Plugins>,
    ),
    useMatchSubject: createComposable(
      datasetInjectionKey,
      createUseMatchSubject<Plugins>,
    ),
    useSubscribeToResource: createComposable(
      datasetInjectionKey,
      createUseSubscribeToResource<Plugins>,
    ),
    useLinkQuery: createComposable(
      datasetInjectionKey,
      createUseLinkQuery<Plugins>,
    ),
    useChangeDataset: createComposable(
      datasetInjectionKey,
      createUseChangeDataset<Plugins>,
    ),
    useChangeSubject: createComposable(
      datasetInjectionKey,
      createUseChangeSubject<Plugins>,
    ),
    useChangeMatchObject: createComposable(
      datasetInjectionKey,
      createUseChangeMatchObject<Plugins>,
    ),
    useChangeMatchSubject: createComposable(
      datasetInjectionKey,
      createUseChangeMatchSubject<Plugins>,
    ),
  };
}

/**
 * @internal
 *
 * A method to create the composable with injected dataset
 */
const createComposable = <
  Plugins extends ConnectedPlugin[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CreateComposable extends (dataset: ConnectedLdoDataset<Plugins>) => any,
>(
  key: InjectionKey<ConnectedLdoDataset<Plugins>>,
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
