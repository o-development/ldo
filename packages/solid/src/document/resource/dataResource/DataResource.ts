import { parseRdf } from "@ldo/ldo";
import { Resource } from "../Resource";
import { DocumentFetchError } from "../../errors/DocumentFetchError";
import { DocumentError } from "../../errors/DocumentError";
import { namedNode, quad as createQuad } from "@rdfjs/data-model";
import type { DatasetChanges } from "@ldo/rdf-utils";
import { changesToSparqlUpdate } from "@ldo/rdf-utils";
import type { Quad } from "@rdfjs/types";

export class DataResource extends Resource {
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
    const response = await this.context.fetch(this.uri, {
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
        `Error fetching resource ${this.uri}`,
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
    const transactionalDataset =
      this.context.solidLdoDataset.startTransaction();
    const graphNode = namedNode(this.uri);
    // Destroy all triples that were once a part of this resouce
    loadedDataset.deleteMatches(undefined, undefined, undefined, graphNode);
    // Add the triples from the fetched item
    loadedDataset.forEach((quad) => {
      transactionalDataset.add(
        createQuad(quad.subject, quad.predicate, quad.object, graphNode),
      );
    });
    transactionalDataset.commit();
    return undefined;
  }

  async update(
    changes: DatasetChanges<Quad>,
  ): Promise<DocumentError | undefined> {
    this.beginWrite();
    // Convert changes to transactional Dataset
    const transactionalDataset =
      this.context.solidLdoDataset.startTransaction();
    changes.added?.forEach((quad) => transactionalDataset.add(quad));
    changes.removed?.forEach((quad) => transactionalDataset.delete(quad));
    // Commit data optimistically
    transactionalDataset.commit();
    // Make request
    const sparqlUpdate = await changesToSparqlUpdate(changes);
    const response = await this.context.fetch(this.uri, {
      method: "PATCH",
      body: sparqlUpdate,
      headers: {
        "Content-Type": "application/sparql-update",
      },
    });
    if (response.status < 200 || response.status > 299) {
      // Handle Error by rollback
      transactionalDataset.rollback();
      this.endWrite(
        new DocumentFetchError(
          this,
          response.status,
          `Problem writing to ${this.uri}`,
        ),
      );
      return;
    }
    this.endWrite();
  }
}
