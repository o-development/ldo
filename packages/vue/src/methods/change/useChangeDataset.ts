import type {
  ConnectedLdoDataset,
  ConnectedLdoTransactionDataset,
  ConnectedPlugin,
} from "@ldo/connected";
import {
  type MaybeRefOrGetter,
  toValue,
  shallowRef,
  watch,
  type Ref,
} from "vue";

export function createUseChangeDataset<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  return function useChangeDataset(
    specificDataset?: MaybeRefOrGetter<ConnectedLdoDataset<Plugins>>,
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
