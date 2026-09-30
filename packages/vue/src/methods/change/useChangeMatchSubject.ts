import type { IConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import { type LdSet, write, type LdoBase, type ShapeType } from "@ldo/ldo";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { createUseChangeDataset } from "./useChangeDataset";
import type { QuadMatch } from "@ldo/rdf-utils";
import { createProxyInteractOptions } from "@ldo/jsonld-dataset-proxy";
import {
  createUseMatchSubject,
  type UseMatchSubjectOptions,
} from "../useMatchSubject";

export function createUseChangeMatchSubject<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
) {
  const useChangeDataset = createUseChangeDataset(dataset);
  const useMatchSubject = createUseMatchSubject(dataset);

  /**
   * Returns a reactive subject that can be modified and committed
   */
  return function useChangeMatchSubject<Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    predicate?: MaybeRefOrGetter<QuadMatch[1] | string | undefined>,
    object?: MaybeRefOrGetter<QuadMatch[2] | string | undefined>,
    graph?: MaybeRefOrGetter<QuadMatch[3] | string | undefined>,
    options?: MaybeRefOrGetter<UseMatchSubjectOptions<Plugins>>,
  ) {
    const resolvedDataset = computed(() => toValue(options)?.dataset);

    const {
      transactionDataset,
      setData: setDataset,
      commitData,
    } = useChangeDataset(resolvedDataset);

    const transactionDatasetOption = computed(() => ({
      dataset: transactionDataset.value,
    }));

    const ldObject = useMatchSubject(
      shapeType,
      predicate,
      object,
      graph,
      transactionDatasetOption,
    );

    const setData = <
      OtherType extends LdoBase | LdSet<LdoBase> | undefined = undefined,
    >(
      writeResource: Plugins[number]["types"]["resource"],
      changer: (
        toChange: OtherType extends undefined ? LdSet<Type> : OtherType,
      ) => void,
      otherType?: OtherType,
    ) => {
      setDataset((dataset) => {
        const ldObject = otherType
          ? write(writeResource.uri).usingCopy(
              createProxyInteractOptions("dataset", dataset).usingCopy(
                otherType,
              )[0],
            )[0]
          : dataset
              .usingType(toValue(shapeType))
              .write(writeResource.uri)
              .matchSubject(
                toValue(predicate),
                toValue(object),
                toValue(graph),
              );

        changer(
          ldObject as OtherType extends undefined ? LdSet<Type> : OtherType,
        );
      });
    };

    return {
      ldo: ldObject,
      setData,
      commitData,
      transactionDataset,
    };
  };
}
