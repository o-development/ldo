import type {
  ConnectedLdoDataset,
  ConnectedPlugin,
  LQInput,
} from "@ldo/connected";
import type { LdoBase, ShapeType } from "@ldo/ldo";
import type { SubjectNode } from "@ldo/rdf-utils";
import { createUseSubject } from "@ldo/vue";
import { type MaybeRefOrGetter, toValue, watch } from "vue";

export function createUseLinkQuery<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
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

        await resourceLinkQuery.subscribe();
        // if already cleaned up, unsubscribe immediately
        if (finished) {
          await resourceLinkQuery.unsubscribeAll();
        }

        onCleanup(async () => {
          finished = true;
          await resourceLinkQuery.unsubscribeAll();
        });
      },
      { immediate: true },
    );

    return createUseSubject(dataset)(shapeType, startingSubject);
  };
}
