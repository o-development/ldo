import type {
  Dataset,
  NamedNode,
  BlankNode,
  DefaultGraph,
  BaseQuad,
} from "@rdfjs/types";


/**
 * An event listeners for nodes
 */
export type nodeEventListener<InAndOutQuad extends BaseQuad = BaseQuad> = (
  dataset: Dataset<InAndOutQuad, InAndOutQuad>,
  changes: DatasetChanges<InAndOutQuad>,
) => void;

/**
 * Adds the bulk method for add and remove
 */
export interface BulkEditableDataset<InAndOutQuad extends BaseQuad = BaseQuad>
  extends Dataset<InAndOutQuad, InAndOutQuad> {
  bulk(changes: DatasetChanges<InAndOutQuad>): this;
}

/**
 * A dataset that allows you to modify the dataset and
 */
export interface TransactionalDataset<InAndOutQuad extends BaseQuad = BaseQuad>
  extends Dataset<InAndOutQuad, InAndOutQuad> {
  rollback(): void;
  commit(): void;
  getChanges(): DatasetChanges<InAndOutQuad>;
}

/**
 * Dataset that allows developers to subscribe to a sepecific term and be alerted
 * if a quad is added or removed containing that term. It's methods follow the
 * EventEmitter interface except take in namedNodes as keys.
 */
export interface SubscribableDataset<InAndOutQuad extends BaseQuad = BaseQuad>
  extends BulkEditableDataset<InAndOutQuad> {
  /**
   * Alias for emitter.on(eventName, listener).
   * @param eventName
   * @param listener
   * @returns
   */
  addListener(
    eventName: DatasetEventMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this;

  /**
   * Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.
   * @param eventName
   * @param dataset
   * @param datasetChanges
   * @returns true if the event had listeners, false otherwise.
   */
  emit(
    eventName: DatasetEventMatch,
    dataset: Dataset<InAndOutQuad, InAndOutQuad>,
    datasetChanges: DatasetChanges<InAndOutQuad>,
  ): boolean;

  /**
   * Returns an array listing the events for which the emitter has registered listeners. The values in the array are strings or Symbols.
   */
  eventNames(): DatasetEventMatch[];

  /**
   * Returns the current max listener value for the EventEmitter which is either set by emitter.setMaxListeners(n) or defaults to events.defaultMaxListeners.
   */
  getMaxListeners(): number;

  /**
   * Returns the number of listeners listening to the event named eventName.
   */
  listenerCount(eventName: DatasetEventMatch): number;

  /**
   * Returns a copy of the array of listeners for the event named eventName.
   */
  listeners(eventName: DatasetEventMatch): nodeEventListener<InAndOutQuad>[];

  /**
   * Alias for emitter.removeListener()
   */
  off(
    eventName: DatasetEventMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): void;

  /**
   * Adds the listener function to the end of the listeners array for the event named eventName. No checks are made to see if the listener has already been added. Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times.
   */
  on(
    eventName: DatasetEventMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this;

  /**
   * Adds a one-time listener function for the event named eventName. The next time eventName is triggered, this listener is removed and then invoked.
   */
  once(
    eventName: DatasetEventMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this;

  /**
   * Adds the listener function to the beginning of the listeners array for the event named eventName. No checks are made to see if the listener has already been added. Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times.
   */
  prependListener(
    eventName: DatasetEventMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this;

  /**
   * Adds a one-time listener function for the event named eventName to the beginning of the listeners array. The next time eventName is triggered, this listener is removed, and then invoked.
   */
  prependOnceListener(
    eventName: DatasetEventMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this;

  /**
   * Removes all listeners, or those of the specified eventName.
   */
  removeAllListeners(eventName: DatasetEventMatch): this;

  /**
   * Removes the specified listener from the listener array for the event named eventName.
   */
  removeListener(
    eventName: DatasetEventMatch,
    listener: nodeEventListener<InAndOutQuad>,
  ): this;

  /**
   * By default EventEmitters will print a warning if more than 10 listeners are added for a particular event. This is a useful default that helps finding memory leaks. The emitter.setMaxListeners() method allows the limit to be modified for this specific EventEmitter instance. The value can be set to Infinity (or 0) to indicate an unlimited number of listeners.
   */
  setMaxListeners(n: number): this;

  /**
   * Returns a copy of the array of listeners for the event named eventName, including any wrappers (such as those created by .once()).
   */
  rawListeners(eventName: DatasetEventMatch): nodeEventListener<InAndOutQuad>[];

  /**
   * ==================================================================
   * TRANSACTION METHODS
   * ==================================================================
   */

  /**
   * Returns a transactional dataset that will update this dataset when its transaction is committed.
   */
  startTransaction(): TransactionalDataset<InAndOutQuad>;
}
