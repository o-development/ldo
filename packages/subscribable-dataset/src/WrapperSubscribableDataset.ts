import { EventEmitter } from "events";
import { quadMatchToString, stringToQuadMatch } from "@ldo/rdf-utils";
import type {
  DatasetChanges,
  QuadMatch,
  SubjectNode,
  PredicateNode,
  ObjectNode,
  GraphNode,
} from "@ldo/rdf-utils";
import type {
  Dataset,
  BaseQuad,
  Stream,
  Term,
  DatasetFactory,
} from "@rdfjs/types";
import type {
  nodeEventListener,
  SubscribableDataset,
  TransactionalDataset,
} from "./types";
import ProxyTransactionalDataset from "./ProxyTransactionalDataset";

/**
 * A wrapper for a dataset that allows subscriptions to be made on nodes to
 * be triggered whenever a quad containing that added or removed.
 */
export default class WrapperSubscribableDataset<
  InAndOutQuad extends BaseQuad = BaseQuad,
> implements SubscribableDataset<InAndOutQuad>
{
  /**
   * The underlying dataset factory
   */
  private datasetFactory: DatasetFactory<InAndOutQuad, InAndOutQuad>;
  /**
   * The underlying dataset
   */
  private dataset: Dataset<InAndOutQuad, InAndOutQuad>;
  /**
   * The underlying event emitter
   */
  private eventEmitter: EventEmitter;
  /**
   * Helps find all the events for a given listener
   */
  private listenerHashMap: Map<nodeEventListener<InAndOutQuad>, Set<string>> =
    new Map();

  /**
   *
   * @param datasetFactory
   * @param initialDataset
   */
  constructor(
    datasetFactory: DatasetFactory<InAndOutQuad, InAndOutQuad>,
    initialDataset?: Dataset<InAndOutQuad, InAndOutQuad>,
  ) {
    this.datasetFactory = datasetFactory;
    this.dataset = initialDataset || this.datasetFactory.dataset();
    this.eventEmitter = new EventEmitter();
  }

  /**
   * ==================================================================
   * DATASET METHODS
   * ==================================================================
   */

  /**
   * Imports the quads into this dataset.
   * This method differs from Dataset.union in that it adds all quads to the current instance, rather than combining quads and the current instance to create a new instance.
   * @param quads
   * @returns the dataset instance it was called on.
   */
  public addAll(
    quads: Dataset<InAndOutQuad, InAndOutQuad> | InAndOutQuad[],
  ): this {
    this.dataset.addAll(quads);
    this.triggerSubscriptionForQuads({
      added: this.datasetFactory.dataset(quads),
    });
    return this;
  }

  /**
   * Bulk add and remove triples
   * @param changed
   */
  public bulk(changed: DatasetChanges<InAndOutQuad>): this {
    if (changed.added) {
      this.dataset.addAll(changed.added);
    }
    if (changed.removed) {
      changed.removed.forEach((quad) => {
        this.dataset.delete(quad);
      });
    }
    this.triggerSubscriptionForQuads(changed);
    return this;
  }

  /**
   * Returns true if the current instance is a superset of the given dataset; differently put: if the given dataset is a subset of, is contained in the current dataset.
   * Blank Nodes will be normalized.
   * @param other
   */
  public contains(other: Dataset<InAndOutQuad, InAndOutQuad>): boolean {
    return this.dataset.contains(other);
  }

  /**
   *  This method removes the quads in the current instance that match the given arguments. The logic described in Quad Matching is applied for each quad in this dataset to select the quads which will be deleted.
   * @param subject
   * @param predicate
   * @param object
   * @param graph
   * @returns the dataset instance it was called on.
   */
  public deleteMatches(
    subject?: Term,
    predicate?: Term,
    object?: Term,
    graph?: Term,
  ): this {
    const matching = this.dataset.match(subject, predicate, object, graph);
    for (const quad of matching) {
      this.dataset.delete(quad);
    }
    this.triggerSubscriptionForQuads({ removed: matching });
    return this;
  }

  /**
   * Returns a new dataset that contains alls quads from the current dataset, not included in the given dataset.
   * @param other
   */
  public difference(
    other: Dataset<InAndOutQuad, InAndOutQuad>,
  ): Dataset<InAndOutQuad, InAndOutQuad> {
    return this.dataset.difference(other);
  }

  /**
   * Returns true if the current instance contains the same graph structure as the given dataset.
   * @param other
   */
  public equals(other: Dataset<InAndOutQuad, InAndOutQuad>): boolean {
    return this.dataset.equals(other);
  }

  /**
   * Universal quantification method, tests whether every quad in the dataset passes the test implemented by the provided iteratee.
   * This method immediately returns boolean false once a quad that does not pass the test is found.
   * This method always returns boolean true on an empty dataset.
   * Note: This method is aligned with Array.prototype.every() in ECMAScript-262.
   * @param iteratee
   */
  public every(
    iteratee: (quad: InAndOutQuad, dataset: this) => boolean,
  ): boolean {
    return this.dataset.every((quad) => iteratee(quad, this));
  }

  /**
   * Creates a new dataset with all the quads that pass the test implemented by the provided iteratee.
   * Note: This method is aligned with Array.prototype.filter() in ECMAScript-262.
   * @param iteratee
   */
  public filter(
    iteratee: (quad: InAndOutQuad, dataset: this) => boolean,
  ): Dataset<InAndOutQuad, InAndOutQuad> {
    return this.dataset.filter((quad) => iteratee(quad, this));
  }

  /**
   * Executes the provided iteratee once on each quad in the dataset.
   * Note: This method is aligned with Array.prototype.forEach() in ECMAScript-262.
   * @param iteratee
   */
  public forEach(iteratee: (quad: InAndOutQuad, dataset: this) => void): void {
    return this.dataset.forEach((quad) => iteratee(quad, this));
  }

  /**
   * Imports all quads from the given stream into the dataset.
   * The stream events end and error are wrapped in a Promise.
   * @param stream
   */
  public async import(stream: Stream<InAndOutQuad>): Promise<this> {
    await this.dataset.import(stream);
    return this;
  }

  /**
   * Returns a new dataset containing alls quads from the current dataset that are also included in the given dataset.
   * @param other
   */
  // Typescript disabled because rdf-js has incorrect typings
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public intersection(
    other: Dataset<InAndOutQuad, InAndOutQuad>,
  ): Dataset<InAndOutQuad, InAndOutQuad> {
    return this.dataset.intersection(other);
  }

  /**
   * Returns a new dataset containing all quads returned by applying iteratee to each quad in the current dataset.
   * @param iteratee
   */
  public map(
    iteratee: (quad: InAndOutQuad, dataset: this) => InAndOutQuad,
  ): Dataset<InAndOutQuad, InAndOutQuad> {
    return this.dataset.map((quad) => iteratee(quad, this));
  }

  /**
   * This method calls the iteratee on each quad of the DatasetCore. The first time the iteratee is called, the accumulator value is the initialValue or, if not given, equals to the first quad of the Dataset. The return value of the iteratee is used as accumulator value for the next calls.
   * This method returns the return value of the last iteratee call.
   * Note: This method is aligned with Array.prototype.reduce() in ECMAScript-262.
   * @param iteratee
   * @param initialValue
   */
  public reduce<A = unknown>(
    iteratee: (accumulator: A, quad: InAndOutQuad, dataset: this) => A,
    initialValue?: A,
  ): A {
    return this.dataset.reduce(
      (acc, quad) => iteratee(acc, quad, this),
      initialValue,
    );
  }

  /**
   * Existential quantification method, tests whether some quads in the dataset pass the test implemented by the provided iteratee.
   * Note: This method is aligned with Array.prototype.some() in ECMAScript-262.
   * @param iteratee
   * @returns boolean true once a quad that passes the test is found.
   */
  public some(
    iteratee: (quad: InAndOutQuad, dataset: this) => boolean,
  ): boolean {
    return this.dataset.some((quad) => iteratee(quad, this));
  }

  /**
   * Returns the set of quads within the dataset as a host language native sequence, for example an Array in ECMAScript-262.
   * Note: Since a DatasetCore is an unordered set, the order of the quads within the returned sequence is arbitrary.
   */
  public toArray(): InAndOutQuad[] {
    return this.dataset.toArray();
  }

  /**
   * Returns an N-Quads string representation of the dataset, preprocessed with RDF Dataset Normalization algorithm.
   */
  public toCanonical(): string {
    return this.dataset.toCanonical();
  }

  /**
   * Returns a stream that contains all quads of the dataset.
   */
  public toStream(): Stream<InAndOutQuad> {
    return this.dataset.toStream();
  }

  /**
   * Returns an N-Quads string representation of the dataset.
   * No prior normalization is required, therefore the results for the same quads may vary depending on the Dataset implementation.
   */
  public toString(): string {
    return this.dataset.toString();
  }

  /**
   * Returns a new Dataset that is a concatenation of this dataset and the quads given as an argument.
   * @param other
   */
  public union(
    quads: Dataset<InAndOutQuad, InAndOutQuad>,
  ): Dataset<InAndOutQuad, InAndOutQuad> {
    return this.dataset.union(quads);
  }

  /**
   * This method returns a new dataset that is comprised of all quads in the current instance matching the given arguments. The logic described in Quad Matching is applied for each quad in this dataset to check if it should be included in the output dataset.
   * @param subject
   * @param predicate
   * @param object
   * @param graph
   * @returns a Dataset with matching triples
   */
  public match(
    subject?: Term | null,
    predicate?: Term | null,
    object?: Term | null,
    graph?: Term | null,
  ): Dataset<InAndOutQuad, InAndOutQuad> {
    return this.dataset.match(subject, predicate, object, graph);
  }

  /**
   * A non-negative integer that specifies the number of quads in the set.
   */
  public get size(): number {
    return this.dataset.size;
  }

  /**
   * Adds the specified quad to the dataset.
   * Existing quads, as defined in Quad.equals, will be ignored.
   * @param quad
   * @returns the dataset instance it was called on.
   */
  public add(quad: InAndOutQuad): this {
    this.dataset.add(quad);
    this.triggerSubscriptionForQuads({
      added: this.datasetFactory.dataset([quad]),
    });
    return this;
  }

  /**
   * Removes the specified quad from the dataset.
   * This method returns the dataset instance it was called on.
   * @param quad
   */
  public delete(quad: InAndOutQuad): this {
    this.dataset.delete(quad);
    this.triggerSubscriptionForQuads({
      removed: this.datasetFactory.dataset([quad]),
    });
    return this;
  }

  /**
   * Determines whether a dataset includes a certain quad, returning true or false as appropriate.
   * @param quad
   */
  public has(quad: InAndOutQuad): boolean {
    return this.dataset.has(quad);
  }

  /**
   * Returns an iterator
   */
  public [Symbol.iterator](): Iterator<InAndOutQuad, unknown, undefined> {
    return this.dataset[Symbol.iterator]();
  }

  /**
   * ==================================================================
   * EVENTEMITTER METHODS
   * ==================================================================
   */

  /**
   * Triggers all subscriptions based on an updated quads
   * @param changed The changed triples of the transaction
   */
  private triggerSubscriptionForQuads(
    changed: DatasetChanges<InAndOutQuad>,
  ): void {
    // A mapping of serialized QuadMatches to the changed quads
    const matchingDatasetChanges: Record<
      string,
      DatasetChanges<InAndOutQuad>
    > = {};

    // Population MatchingDatasetChanges
    const populateMatchingDatasetChanges = (
      changeType: "added" | "removed",
    ) => {
      const changedQuads = changed[changeType];
      changedQuads?.forEach((changedQuad) => {
        // Cast the input because RDFJS types assume RDF 1.2 where a Subject can
        // be a Quad
        const quad = changedQuad as {
          subject: SubjectNode;
          predicate: PredicateNode;
          object: ObjectNode;
          graph: GraphNode;
        };
        // All possible matches that could match with this triple
        const quadMatches: QuadMatch[] = [
          [null, null, null, null],
          [quad.subject, null, null, null],
          [quad.subject, quad.predicate, null, null],
          [quad.subject, null, quad.object, null],
          [null, quad.predicate, null, null],
          [null, quad.predicate, quad.object, null],
          [null, null, quad.object, null],
          [quad.subject, quad.predicate, quad.object, null],
          [null, null, null, quad.graph],
          [quad.subject, null, null, quad.graph],
          [quad.subject, quad.predicate, null, quad.graph],
          [quad.subject, null, quad.object, quad.graph],
          [null, quad.predicate, null, quad.graph],
          [null, quad.predicate, quad.object, quad.graph],
          [null, null, quad.object, quad.graph],
          [quad.subject, quad.predicate, quad.object, quad.graph],
        ];
        quadMatches.forEach((quadMatch) => {
          const eventName = quadMatchToString(quadMatch);
          // Only add to the map if there's actually a listener for this
          if (this.eventEmitter.listenerCount(eventName) > 0) {
            // Set matchingDatasetChanges to include data to emit
            if (!matchingDatasetChanges[eventName]) {
              matchingDatasetChanges[eventName] = {};
            }
            if (!matchingDatasetChanges[eventName][changeType]) {
              matchingDatasetChanges[eventName][changeType] =
                this.datasetFactory.dataset();
            }
            matchingDatasetChanges[eventName][changeType]?.add(changedQuad);
          }
        });
      });
    };
    populateMatchingDatasetChanges("added");
    populateMatchingDatasetChanges("removed");

    // Alert all listeners
    Object.entries(matchingDatasetChanges).forEach(
      ([quadMatchString, changes]) => {
        this.eventEmitter.emit(quadMatchString, changes);
      },
    );
  }

  /**
   * Alias for emitter.on(eventName, listener).
   * @param eventName
   * @param listener
   * @returns
   */
  public addListener(
    eventName: QuadMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this {
    return this.on(eventName, listener);
  }

  /**
   * Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.
   * @param eventName
   * @param dataset
   * @param datasetChanges
   * @returns true if the event had listeners, false otherwise.
   */
  public emit(
    eventName: QuadMatch,
    changes: DatasetChanges<InAndOutQuad>,
  ): boolean {
    return this.eventEmitter.emit(quadMatchToString(eventName), changes);
  }

  /**
   * Returns an array listing the events for which the emitter has registered listeners. The values in the array are strings or Symbols.
   */
  public eventNames(): QuadMatch[] {
    return this.eventEmitter
      .eventNames()
      .map((eventName) => stringToQuadMatch(eventName as string));
  }

  /**
   * Returns the current max listener value for the EventEmitter which is either set by emitter.setMaxListeners(n) or defaults to events.defaultMaxListeners.
   */
  public getMaxListeners(): number {
    return this.eventEmitter.getMaxListeners();
  }

  /**
   * Returns the number of listeners listening to the event named eventName.
   */
  public listenerCount(eventName: QuadMatch): number {
    return this.eventEmitter.listenerCount(quadMatchToString(eventName));
  }

  /**
   * Returns a copy of the array of listeners for the event named eventName.
   */
  public listeners(eventName: QuadMatch): nodeEventListener<InAndOutQuad>[] {
    return this.eventEmitter.listeners(
      quadMatchToString(eventName),
    ) as nodeEventListener<InAndOutQuad>[];
  }

  /**
   * Alias for emitter.removeListener()
   */
  public off(
    eventName: QuadMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): void {
    this.removeListener(eventName, listener);
  }

  /**
   * Adds the listener function to the end of the listeners array for the event named eventName. No checks are made to see if the listener has already been added. Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times.
   */
  public on(
    eventName: QuadMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this {
    const eventString = quadMatchToString(eventName);
    if (!this.listenerHashMap.has(listener)) {
      this.listenerHashMap.set(listener, new Set());
    }
    this.listenerHashMap.get(listener)?.add(eventString);
    this.eventEmitter.on(eventString, listener);
    return this;
  }

  /**
   * Adds a one-time listener function for the event named eventName. The next time eventName is triggered, this listener is removed and then invoked.
   */
  public once(
    eventName: QuadMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this {
    this.eventEmitter.once(quadMatchToString(eventName), listener);
    return this;
  }

  /**
   * Adds the listener function to the beginning of the listeners array for the event named eventName. No checks are made to see if the listener has already been added. Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times.
   */
  public prependListener(
    eventName: QuadMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this {
    this.eventEmitter.prependListener(quadMatchToString(eventName), listener);
    return this;
  }

  /**
   * Adds a one-time listener function for the event named eventName to the beginning of the listeners array. The next time eventName is triggered, this listener is removed, and then invoked.
   */
  public prependOnceListener(
    eventName: QuadMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this {
    this.eventEmitter.prependOnceListener(
      quadMatchToString(eventName),
      listener,
    );
    return this;
  }

  /**
   * Removes all listeners, or those of the specified eventName.
   */
  public removeAllListeners(eventName: QuadMatch): this {
    this.eventEmitter.removeAllListeners(quadMatchToString(eventName));
    return this;
  }

  /**
   * Removes the specified listener from the listener array for the event named eventName.
   */
  public removeListener(
    eventName: QuadMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this {
    this.eventEmitter.removeListener(quadMatchToString(eventName), listener);
    return this;
  }

  /**
   * Removes the specified listener from the listener array for the event named eventName.
   */
  removeListenerFromAllEvents(listener: nodeEventListener<InAndOutQuad>): this {
    const eventStringSet = this.listenerHashMap.get(listener);
    if (eventStringSet) {
      eventStringSet.forEach((eventString) => {
        this.eventEmitter.off(eventString, listener);
      });
    }
    return this;
  }

  /**
   * By default EventEmitters will print a warning if more than 10 listeners are added for a particular event. This is a useful default that helps finding memory leaks. The emitter.setMaxListeners() method allows the limit to be modified for this specific EventEmitter instance. The value can be set to Infinity (or 0) to indicate an unlimited number of listeners.
   */
  public setMaxListeners(n: number): this {
    this.eventEmitter.setMaxListeners(n);
    return this;
  }

  /**
   * Returns a copy of the array of listeners for the event named eventName, including any wrappers (such as those created by .once()).
   */
  public rawListeners(eventName: QuadMatch): nodeEventListener<InAndOutQuad>[] {
    return this.eventEmitter.rawListeners(
      quadMatchToString(eventName),
    ) as nodeEventListener[];
  }

  /**
   * ==================================================================
   * TRANSACTION METHODS
   * ==================================================================
   */

  /**
   * Returns a transactional dataset that will update this dataset when its transaction is committed.
   */
  public startTransaction(): TransactionalDataset<InAndOutQuad> {
    return new ProxyTransactionalDataset(this, this.datasetFactory);
  }
}
