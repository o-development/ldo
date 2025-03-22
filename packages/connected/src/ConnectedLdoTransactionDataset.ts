/* eslint-disable @typescript-eslint/no-explicit-any */
import { LdoTransactionDataset } from "@ldo/ldo";
import type { DatasetFactory, Quad } from "@rdfjs/types";
import {
  updateDatasetInBulk,
  type ITransactionDatasetFactory,
} from "@ldo/subscribable-dataset";
import type { DatasetChanges, GraphNode } from "@ldo/rdf-utils";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import type { ConnectedContext } from "./ConnectedContext";
import type { InvalidIdentifierResource } from "./InvalidIdentifierResource";
import type { IConnectedLdoDataset } from "./IConnectedLdoDataset";
import { splitChangesByGraph } from "./util/splitChangesByGraph";
import type { IgnoredInvalidUpdateSuccess } from "./results/success/UpdateSuccess";
import { UpdateDefaultGraphSuccess } from "./results/success/UpdateSuccess";
import type { ErrorResult } from "./results/error/ErrorResult";
import { AggregateError } from "./results/error/ErrorResult";
import type {
  AggregateSuccess,
  SuccessResult,
} from "./results/success/SuccessResult";

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
export class ConnectedLdoTransactionDataset<Plugins extends ConnectedPlugin[]>
  extends LdoTransactionDataset
  implements IConnectedLdoDataset<Plugins>
{
  /**
   * @internal
   */
  public context: ConnectedContext<Plugins>;

  /**
   * @internal
   * Serves no purpose
   */
  protected resourceMap: Map<string, Plugins[number]["types"]["resource"]> =
    new Map();

  /**
   * @param context - SolidLdoDatasetContext
   * @param datasetFactory - An optional dataset factory
   * @param transactionDatasetFactory - A factory for creating transaction datasets
   * @param initialDataset - A set of triples to initialize this dataset
   */
  constructor(
    parentDataset: IConnectedLdoDataset<Plugins>,
    context: ConnectedContext<Plugins>,
    datasetFactory: DatasetFactory,
    transactionDatasetFactory: ITransactionDatasetFactory<Quad>,
  ) {
    super(parentDataset, datasetFactory, transactionDatasetFactory);
    this.context = context;
  }

  getResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends string,
  >(
    uri: UriType,
    pluginName?: Name | undefined,
  ): UriType extends Plugin["types"]["uri"]
    ? Plugin["getResource"] extends (arg: UriType, context: any) => infer R
      ? R
      : never
    : InvalidIdentifierResource | ReturnType<Plugin["getResource"]> {
    return this.context.dataset.getResource(uri, pluginName);
  }

  createResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(name: Name): Promise<ReturnType<Plugin["createResource"]>> {
    return this.context.dataset.createResource(name);
  }

  setContext<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(name: Name, context: Plugin["types"]["context"]): void {
    this.context.dataset.setContext(name, context);
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
  public startTransaction(): ConnectedLdoTransactionDataset<Plugins> {
    return new ConnectedLdoTransactionDataset(
      this,
      this.context,
      this.datasetFactory,
      this.transactionDatasetFactory,
    );
  }

  async commitChanges(): Promise<
    | AggregateSuccess<
        | Extract<
            Awaited<ReturnType<Plugins[number]["types"]["resource"]["update"]>>,
            { isError: false }
          >
        | UpdateDefaultGraphSuccess
        | IgnoredInvalidUpdateSuccess<Plugins[number]["types"]["resource"]>
      >
    | AggregateError<
        Extract<
          Awaited<ReturnType<Plugins[number]["types"]["resource"]["update"]>>,
          { isError: true }
        >
      >
  > {
    const changes = this.getChanges();
    const changesByGraph = splitChangesByGraph(changes);

    // Iterate through all changes by graph in
    const results: [
      GraphNode,
      DatasetChanges<Quad>,
      (
        | Awaited<ReturnType<Plugins[number]["types"]["resource"]["update"]>>
        | IgnoredInvalidUpdateSuccess<any>
        | UpdateDefaultGraphSuccess
      ),
    ][] = await Promise.all(
      Array.from(changesByGraph.entries()).map(
        async ([graph, datasetChanges]) => {
          if (graph.termType === "DefaultGraph") {
            // Undefined means that this is the default graph
            updateDatasetInBulk(this.parentDataset, datasetChanges);
            return [graph, datasetChanges, new UpdateDefaultGraphSuccess()];
          }
          const resource = this.getResource(
            graph.value,
          ) as Plugins[number]["types"]["resource"];
          const updateResult = (await resource.update(
            datasetChanges,
          )) as Awaited<
            ReturnType<Plugins[number]["types"]["resource"]["update"]>
          >;
          return [graph, datasetChanges, updateResult];
        },
      ),
    );

    // If one has errored, return error
    const errors = (
      results.map((result) => result[2]) as (SuccessResult | ErrorResult)[]
    ).filter((result): result is ErrorResult => result.isError);

    if (errors.length > 0) {
      // HACK: Cast to Any
      return new AggregateError(errors) as any;
    }
    return {
      isError: false,
      type: "aggregateSuccess",
      // HACK: Cast to Any
      results: results.map((result) => result[2]) as any,
    };
  }
}
