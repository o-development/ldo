import type {
  IConnectedLdoDataset,
  ConnectedPlugin,
  ConnectedLdoTransactionDataset,
} from "@ldo/connected";
import { type LdSet, write, type LdoBase, type ShapeType } from "@ldo/ldo";
import { computed, type Ref, toValue, type MaybeRefOrGetter } from "vue";
import { createUseChangeDataset } from "./useChangeDataset";
import type { SubjectNode } from "@ldo/rdf-utils";
import { createUseSubject, type UseSubjectOptions } from "../useSubject";
import { createProxyInteractOptions } from "@ldo/jsonld-dataset-proxy";

export interface UseChangeSubjectComposable<Plugin extends ConnectedPlugin> {
  <Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject: MaybeRefOrGetter<string | SubjectNode | undefined>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugin>>,
  ): {
    ldo: Ref<Type | undefined>;
    transactionDataset: Ref<ConnectedLdoTransactionDataset<Plugin[]>>;
    setData: <
      OtherType extends LdoBase | LdSet<LdoBase> | undefined = undefined,
    >(
      writeResource: Plugin["types"]["resource"],
      changer: (
        toChange: OtherType extends undefined ? Type : OtherType,
      ) => void,
      otherType?: OtherType,
    ) => void;
    commitData: () => ReturnType<
      ConnectedLdoTransactionDataset<Plugin[]>["commitToRemote"]
    >;
  };
}

/**
 * @internal
 *
 * Creates a useChangeSubject composable.
 */
export function createUseChangeSubject<Plugin extends ConnectedPlugin>(
  dataset: IConnectedLdoDataset<Plugin[]>,
): UseChangeSubjectComposable<Plugin> {
  const useChangeDataset = createUseChangeDataset(dataset);
  const useSubject = createUseSubject(dataset);

  /**
   * Returns a reactive subject that can be modified and committed
   */
  return function useChangeSubject<Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject: MaybeRefOrGetter<string | SubjectNode | undefined>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugin>>,
  ) {
    const resolvedDataset = computed(() => toValue(options)?.dataset);

    const {
      transactionDataset,
      setData: setDataset,
      commitData,
    } = useChangeDataset(resolvedDataset);

    const subjectTransactionDataset = computed(() => ({
      dataset: transactionDataset.value,
    }));

    const ldObject = useSubject(shapeType, subject, subjectTransactionDataset);

    const setData = <
      OtherType extends LdoBase | LdSet<LdoBase> | undefined = undefined,
    >(
      writeResource: Plugin["types"]["resource"],
      changer: (
        toChange: OtherType extends undefined ? Type : OtherType,
      ) => void,
      otherType?: OtherType,
    ) => {
      const subjectValue = toValue(subject);
      if (!subjectValue) return;
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
              .fromSubject(subjectValue);

        changer(ldObject as OtherType extends undefined ? Type : OtherType);
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
