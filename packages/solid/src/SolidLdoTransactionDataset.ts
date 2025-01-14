import { LdoTransactionDataset } from "@ldo/ldo";
import type { ISolidLdoDataset } from "./types";
import type { ResourceGetterOptions } from "./ResourceStore";
import type { Container } from "./resource/Container";
import type { Leaf } from "./resource/Leaf";
import {
  isContainerUri,
  type ContainerUri,
  type LeafUri,
} from "./util/uriTypes";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import type { DatasetFactory, Quad } from "@rdfjs/types";
import {
  updateDatasetInBulk,
  type ITransactionDatasetFactory,
} from "@ldo/subscribable-dataset";
import type { SolidLdoDataset } from "./SolidLdoDataset";
import type { AggregateSuccess } from "./requester/results/success/SuccessResult";
import type { ResourceResult } from "./resource/resourceResult/ResourceResult";
import type {
  IgnoredInvalidUpdateSuccess,
  UpdateDefaultGraphSuccess,
  UpdateSuccess,
} from "./requester/results/success/UpdateSuccess";
import { AggregateError } from "./requester/results/error/ErrorResult";
import type {
  UpdateResult,
  UpdateResultError,
} from "./requester/requests/updateDataResource";
import type { DatasetChanges, GraphNode } from "@ldo/rdf-utils";
import { splitChangesByGraph } from "./util/splitChangesByGraph";

/**
 * A SolidLdoTransactionDataset has all the functionality of a SolidLdoDataset
 * and represents a transaction to the parent SolidLdoDataset.
 *
 * It is recommended to use the `startTransaction` method on a SolidLdoDataset
 * to initialize this class
 *
 * @example
 * ```typescript
 * import { createSolidLdoDataset } from "@ldo/solid";
 * import { ProfileShapeType } from "./.ldo/profile.shapeTypes.ts"
 *
 * // ...
 *
 * const solidLdoDataset = createSolidLdoDataset();
 *
 * const profileDocument = solidLdoDataset
 *   .getResource("https://example.com/profile");
 * await profileDocument.read();
 *
 * const transaction = solidLdoDataset.startTransaction();
 *
 * const profile = transaction
 *   .using(ProfileShapeType)
 *   .fromSubject("https://example.com/profile#me");
 * profile.name = "Some Name";
 * await transaction.commitToPod();
 * ```
 */
export class SolidLdoTransactionDataset
  extends LdoTransactionDataset
  implements ISolidLdoDataset
{
  /**
   * @internal
   */
  public context: SolidLdoDatasetContext;

  /**
   * @param context - SolidLdoDatasetContext
   * @param datasetFactory - An optional dataset factory
   * @param transactionDatasetFactory - A factory for creating transaction datasets
   * @param initialDataset - A set of triples to initialize this dataset
   */
  constructor(
    parentDataset: SolidLdoDataset,
    context: SolidLdoDatasetContext,
    datasetFactory: DatasetFactory,
    transactionDatasetFactory: ITransactionDatasetFactory<Quad>,
  ) {
    super(parentDataset, datasetFactory, transactionDatasetFactory);
    this.context = context;
  }

  /**
   * Retireves a representation (either a LeafResource or a ContainerResource)
   * of a Solid Resource at the given URI. This resource represents the
   * current state of the resource: whether it is currently fetched or in the
   * process of fetching as well as some information about it.
   *
   * @param uri - the URI of the resource
   * @param options - Special options for getting the resource
   *
   * @returns a Leaf or Container Resource
   *
   * @example
   * ```typescript
   * const profileDocument = solidLdoDataset
   *   .getResource("https://example.com/profile");
   * ```
   */
  getResource(uri: ContainerUri, options?: ResourceGetterOptions): Container;
  getResource(uri: LeafUri, options?: ResourceGetterOptions): Leaf;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container {
    return this.context.resourceStore.get(uri, options);
  }

  async commitToPod(): Promise<
    | AggregateSuccess<
        ResourceResult<UpdateSuccess | UpdateDefaultGraphSuccess, Leaf>
      >
    | AggregateError<UpdateResultError>
  > {
    const changes = this.getChanges();
    const changesByGraph = splitChangesByGraph(changes);

    console.log(changesByGraph);

    // Iterate through all changes by graph in
    const results: [
      GraphNode,
      DatasetChanges<Quad>,
      UpdateResult | IgnoredInvalidUpdateSuccess | UpdateDefaultGraphSuccess,
    ][] = await Promise.all(
      Array.from(changesByGraph.entries()).map(
        async ([graph, datasetChanges]) => {
          if (graph.termType === "DefaultGraph") {
            // Undefined means that this is the default graph
            updateDatasetInBulk(this.parentDataset, datasetChanges);
            return [
              graph,
              datasetChanges,
              {
                type: "updateDefaultGraphSuccess",
                isError: false,
              } as UpdateDefaultGraphSuccess,
            ];
          }
          if (isContainerUri(graph.value)) {
            return [
              graph,
              datasetChanges,
              {
                type: "ignoredInvalidUpdateSuccess",
                isError: false,
              } as IgnoredInvalidUpdateSuccess,
            ];
          }
          const resource = this.getResource(graph.value as LeafUri);
          const updateResult = await resource.update(datasetChanges);
          return [graph, datasetChanges, updateResult];
        },
      ),
    );

    // If one has errored, return error
    const errors = results.filter((result) => result[2].isError);

    if (errors.length > 0) {
      return new AggregateError(
        errors.map((result) => result[2] as UpdateResultError),
      );
    }
    return {
      isError: false,
      type: "aggregateSuccess",
      results: results
        .map((result) => result[2])
        .filter(
          (result): result is ResourceResult<UpdateSuccess, Leaf> =>
            result.type === "updateSuccess" ||
            result.type === "updateDefaultGraphSuccess" ||
            result.type === "ignoredInvalidUpdateSuccess",
        ),
    };
  }
}
