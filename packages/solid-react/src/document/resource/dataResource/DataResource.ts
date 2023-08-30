import { LdoDataset, parseRdf } from "ldo";
import { Resource, ResourceDependencies } from "../Resource";
import { DocumentFetchError } from "../../errors/DocumentFetchError";
import { DocumentError } from "../../errors/DocumentError";
import { namedNode, quad as createQuad } from "@rdfjs/data-model";
import { DatasetChanges } from "o-dataset-pack";
import { Quad } from "@rdfjs/types";
import { changesToSparqlUpdate } from "../../../util/changesToSparqlUpdate";
import { UpdateManager } from "../../../ldoHooks/helpers/UpdateManager";

export interface DataResourceDependencies extends ResourceDependencies {
  dataset: LdoDataset;
  updateManager: UpdateManager;
}

export class DataResource extends Resource {
  private dependencies2;

  constructor(uri: string, dependencies: DataResourceDependencies) {
    super(uri, dependencies);
    this.dependencies2 = dependencies;
  }

  /**
   * ===========================================================================
   * Getters
   * ===========================================================================
   */
  protected get dataset() {
    return this.dependencies2.dataset;
  }

  protected get updateManager() {
    return this.dependencies2.updateManager;
  }

  /**
   * ===========================================================================
   * Methods
   * ===========================================================================
   */
  async create() {
    // TODO
  }

  protected async fetchDocument(): Promise<DocumentError | undefined> {
    // Fetch the document using auth fetch
    const response = await this.fetch(this.uri, {
      headers: {
        accept: "text/turtle",
      },
    });
    // Handle Error
    if (response.status !== 200) {
      // TODO: Handle edge cases
      return new DocumentFetchError(
        this,
        response.status,
        `Error fetching resource ${this.uri}`
      );
    }
    // Parse the incoming turtle into a dataset
    const rawTurtle = await response.text();
    let loadedDataset;
    try {
      loadedDataset = await parseRdf(rawTurtle, {
        baseIRI: this.uri,
      });
    } catch (err) {
      if (typeof err === "object" && (err as Error).message) {
        return new DocumentError(this, (err as Error).message);
      }
      return new DocumentError(this, "Server returned poorly formatted Turtle");
    }
    // Start transaction
    const transactionalDataset = this.dataset.startTransaction();
    const graphNode = namedNode(this.uri);
    // Destroy all triples that were once a part of this resouce
    loadedDataset.deleteMatches(undefined, undefined, undefined, graphNode);
    // Add the triples from the fetched item
    loadedDataset.forEach((quad) => {
      transactionalDataset.add(
        createQuad(quad.subject, quad.predicate, quad.object, graphNode)
      );
    });
    const changes = transactionalDataset.getChanges();
    this.updateManager.notifyListenersOfChanges(changes);
    transactionalDataset.commit();
    return undefined;
  }

  async update(
    changes: DatasetChanges<Quad>
  ): Promise<DocumentError | undefined> {
    this.beginWrite();
    // Convert changes to transactional Dataset
    const transactionalDataset = this.dataset.startTransaction();
    changes.added?.forEach((quad) => transactionalDataset.add(quad));
    changes.removed?.forEach((quad) => transactionalDataset.delete(quad));
    // Commit data optimistically
    transactionalDataset.commit();
    this.updateManager.notifyListenersOfChanges(changes);
    // Make request
    const sparqlUpdate = await changesToSparqlUpdate(changes);
    const response = await this.fetch(this.uri, {
      method: "PATCH",
      body: sparqlUpdate,
      headers: {
        "Content-Type": "application/sparql-update",
      },
    });
    if (response.status < 200 || response.status > 299) {
      // Handle Error by rollback
      transactionalDataset.rollback();
      this.updateManager.notifyListenersOfChanges(changes);
      this.endWrite(
        new DocumentFetchError(
          this,
          response.status,
          `Problem writing to ${this.uri}`
        )
      );
      return;
    }
    this.endWrite();
  }
}
