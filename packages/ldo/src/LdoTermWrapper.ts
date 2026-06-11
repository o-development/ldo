import type { DataFactory, DatasetCore, Term } from "@rdfjs/types";
import { TermWrapper } from "@rdfjs/wrapper";
import type { GraphWriteDataset } from "./GraphWriteDataset.js";

/**
 * Base class for all LDO-managed TermWrapper subclasses.
 *
 * It is constructed with a {@link GraphWriteDataset} view as its dataset (so
 * that `@rdfjs/wrapper` internals — `OptionalAs`, `RequiredFrom`, etc. — get
 * the correct write-graph routing). Externally, `underlyingDataset` exposes
 * the actual mutable store that backs the view.
 *
 * Generated TermWrapper classes should extend this class instead of
 * `TermWrapper` directly.
 */
export abstract class LdoTermWrapper extends TermWrapper {
  constructor(term: string | Term, dataset: DatasetCore, factory: DataFactory) {
    super(term, dataset, factory);
  }

  /**
   * The underlying mutable dataset that backs this LDO's view.
   *
   * While `this.dataset` returns the {@link GraphWriteDataset} view used
   * internally for graph-routing, `underlyingDataset` bypasses that view and
   * returns the actual store. Use this when you need unrestricted, graph-aware
   * access to the data — e.g. to add quads with an explicit named graph or to
   * pass the store to another API.
   */
  get underlyingDataset(): DatasetCore {
    return (this.dataset as GraphWriteDataset).writeBase ?? this.dataset;
  }
}
