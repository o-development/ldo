import type {
  ConnectedLdoTransactionDataset,
  ConnectedPlugin,
  IConnectedLdoDataset,
} from "@ldo/connected";
import {
  type MaybeRefOrGetter,
  toValue,
  shallowRef,
  watch,
  type Ref,
} from "vue";

/**
 * @internal
 *
 * Creates a useChangeDataset composable
 */
export function createUseChangeDataset<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
) {
  /**
   * Returns a transaction on the dataset that can be modified and committed.
   *
   * @example
   * ```ts
   * const { transactionDataset, setData, commitData } = useChangeDataset();
   * // you must populate the dataset with data in order to change it
   * const resource = useResource(resourceUri);
   *
   * // you can do this in a callback, e. g. form update
   * setData((dataset) => {
   *   // perform operations on the dataset
   *   dataset.deleteMatches(some, match);
   *   dataset.add(quad(subject, predicate, object, graph))
   *   // etc...
   * });
   *
   * // save the data
   * const result = await results.changeDataset.commitData()
   *
   * // check the result for errors
   * ```
   */
  return function useChangeDataset(
    specificDataset?: MaybeRefOrGetter<
      IConnectedLdoDataset<Plugins> | undefined
    >,
  ) {
    const transactionDataset = shallowRef<
      ConnectedLdoTransactionDataset<Plugins>
    >() as Ref<ConnectedLdoTransactionDataset<Plugins>>;

    watch(
      () => toValue(specificDataset),
      (newDataset) => {
        transactionDataset.value = (newDataset ?? dataset).startTransaction();
      },
      { deep: false, immediate: true },
    );

    const setData = (
      changer: (toChange: ConnectedLdoTransactionDataset<Plugins>) => void,
    ) => {
      const subTransaction = transactionDataset.value.startTransaction();
      changer(subTransaction);
      subTransaction.commit();
    };

    const commitData = async () => {
      const result = await transactionDataset.value.commitToRemote();
      if (!result.isError) {
        // Replace with a new transaction from the dataset or specificDataset
        transactionDataset.value = (
          toValue(specificDataset) ?? dataset
        ).startTransaction();
      }
      return result;
    };

    return { transactionDataset, setData, commitData };
  };
}
