import type {
  IConnectedLdoDataset,
  ConnectedPlugin,
  LQInput,
} from "@ldo/connected";
import type { LdoBase, ShapeType } from "@ldo/ldo";
import type { SubjectNode } from "@ldo/rdf-utils";
import { createUseSubject } from "./useSubject";
import { type MaybeRefOrGetter, type Ref, toValue, watch } from "vue";

export interface UseLinkQueryComposable {
  <Type extends LdoBase, QueryInput extends LQInput<Type>>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    startingResource: MaybeRefOrGetter<string>,
    startingSubject: MaybeRefOrGetter<SubjectNode | string>,
    linkQuery: MaybeRefOrGetter<QueryInput>,
  ): Ref<Type>;
}

/**
 * @internal
 *
 * Creates a useLinkQuery composable.
 */
export function createUseLinkQuery<Plugin extends ConnectedPlugin>(
  dataset: IConnectedLdoDataset<Plugin[]>,
): UseLinkQueryComposable {
  /**
   * Runs a LDO link query.
   * Subscribes to related changes.
   * Returns the starting point as a reactive Linked Data Object.
   */
  return function useLinkQuery<
    Type extends LdoBase,
    QueryInput extends LQInput<Type>,
  >(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    startingResource: MaybeRefOrGetter<string>,
    startingSubject: MaybeRefOrGetter<SubjectNode | string>,
    linkQuery: MaybeRefOrGetter<QueryInput>,
  ) {
    watch(
      [
        () => toValue(shapeType),
        () => toValue(startingResource),
        () => toValue(startingSubject),
        () => toValue(linkQuery),
      ],
      async (
        [shapeType, startingResourceUri, startingSubjectUri, linkQuery],
        _,
        onCleanup,
      ) => {
        let finished = false;
        const resource = dataset.getResource(startingResourceUri);
        const resourceLinkQuery = dataset
          .usingType(shapeType)
          .startLinkQuery(resource, startingSubjectUri, linkQuery);

        // register cleanup before first await
        onCleanup(async () => {
          finished = true;
          await resourceLinkQuery.unsubscribeAll();
        });

        await resourceLinkQuery.subscribe();
        // if already cleaned up, unsubscribe immediately
        if (finished) {
          await resourceLinkQuery.unsubscribeAll();
        }
      },
      { immediate: true },
    );

    return createUseSubject(dataset)(shapeType, startingSubject);
  };
}
