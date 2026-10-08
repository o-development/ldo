import type { IConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import { type LdSet, write, type LdoBase, type ShapeType } from "@ldo/ldo";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { createUseChangeDataset } from "./useChangeDataset";
import type { QuadMatch } from "@ldo/rdf-utils";
import { createProxyInteractOptions } from "@ldo/jsonld-dataset-proxy";
import {
  createUseMatchObject,
  type UseMatchObjectOptions,
} from "../useMatchObject";

/**
 * @internal
 *
 * Creates a useChangeMatchObject composable
 */
export function createUseChangeMatchObject<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
) {
  const useChangeDataset = createUseChangeDataset(dataset);
  const useMatchObject = createUseMatchObject(dataset);

  /**
   * Returns a reactive list of matched objects that can be modified and committed
   */
  return function useChangeMatchObject<Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject?: MaybeRefOrGetter<QuadMatch[0] | string | undefined>,
    predicate?: MaybeRefOrGetter<QuadMatch[1] | string | undefined>,
    graph?: MaybeRefOrGetter<QuadMatch[3] | string | undefined>,
    options?: MaybeRefOrGetter<UseMatchObjectOptions<Plugins>>,
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

    const ldObject = useMatchObject(
      shapeType,
      subject,
      predicate,
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
              .matchObject(
                toValue(subject),
                toValue(predicate),
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
