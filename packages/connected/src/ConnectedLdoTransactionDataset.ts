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
import type {
  GetResourceReturnType,
  IConnectedLdoDataset,
} from "./IConnectedLdoDataset";
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
 * A ConnectedLdoTransactionDataset has all the functionality of a
 * ConnectedLdoDataset and represents a transaction to the parent
 * ConnectedLdoDataset.
 *
 * It is recommended to use the `startTransaction` method on a SolidLdoDataset
 * to initialize this class
 *
 * @example
 * ```typescript
 * import { createConnectedLdoDataset } from "@ldo/connected";
 * import { ProfileShapeType } from "./.ldo/profile.shapeTypes.ts"
 * import { solidConnectedPlugin } from "connected-solid";
 *
 * // ...
 *
 * const connectedLdoDataset = createConnectedLdoDataset([
 *   solidConnectedPlugin
 * ]);
 *
 * const profileDocument = connectedLdoDataset
 *   .getResource("https://example.com/profile");
 * await profileDocument.read();
 *
 * const transaction = connectedLdoDataset.startTransaction();
 *
 * const profile = transaction
 *   .using(ProfileShapeType)
 *   .fromSubject("https://example.com/profile#me");
 * profile.name = "Some Name";
 * const result = await transaction.commitToRemote();
 * if (result.isError) {
 *   // handle error
 * }
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
  >(uri: UriType, pluginName?: Name): GetResourceReturnType<Plugin, UriType> {
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

  forgetResource(uri: string): boolean {
    return this.context.dataset.forgetResource(uri);
  }
  forgetAllResources(): void {
    this.context.dataset.forgetAllResources();
  }

  public startTransaction(): ConnectedLdoTransactionDataset<Plugins> {
    return new ConnectedLdoTransactionDataset(
      this,
      this.context,
      this.datasetFactory,
      this.transactionDatasetFactory,
    );
  }

  /**
   * Commits all changes made in this transaction to the remote connected
   * platforms as well as the parent dataset.
   *
   * @returns A success or failure
   *
   * @example
   * ```typescript
   * import { createConnectedLdoDataset } from "@ldo/connected";
   * import { ProfileShapeType } from "./.ldo/profile.shapeTypes.ts"
   * import { solidConnectedPlugin } from "connected-solid";
   *
   * // ...
   *
   * const connectedLdoDataset = createConnectedLdoDataset([solidConnectedPlugin]);
   *
   * const profileDocument = connectedLdoDataset
   *   .getResource("https://example.com/profile");
   * await profileDocument.read();
   *
   * const transaction = connectedLdoDataset.startTransaction();
   *
   * const profile = transaction
   *   .using(ProfileShapeType)
   *   .fromSubject("https://example.com/profile#me");
   * profile.name = "Some Name";
   * const result = await transaction.commitToRemote();
   * if (result.isError) {
   *   // handle error
   * }
   * ```
   */
  async commitToRemote(): Promise<
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
