import { ContainerShapeType } from "../../../../ldo/solid.shapeTypes";
import type { Resource } from "../../Resource";
import { DataResource } from "../DataResource";

export class ContainerResource extends DataResource {
  private _contains: Set<Resource> = new Set();

  /**
   * ===========================================================================
   * Getters
   * ===========================================================================
   */
  get contains() {
    return Array.from(this._contains);
  }

  /**
   * ===========================================================================
   * Methods
   * ===========================================================================
   */
  protected async fetchDocument() {
    const error = await super.fetchDocument();
    if (error) {
      return error;
    }
    // Update the contains
    const container = this.context.solidLdoDataset
      .usingType(ContainerShapeType)
      .fromSubject(this.uri);
    const resourcesToAdd: Resource[] = [];
    container.contains?.forEach((resourceData) => {
      if (resourceData["@id"]) {
        if (resourceData.type?.some((type) => type["@id"] === "Container")) {
          resourcesToAdd.push(
            this.context.containerResourceStore.get(resourceData["@id"]),
          );
        } else {
          if (resourceData["@id"].endsWith(".ttl")) {
            resourcesToAdd.push(
              this.context.dataResourceStore.get(resourceData["@id"]),
            );
          } else {
            resourcesToAdd.push(
              this.context.binaryResourceStore.get(resourceData["@id"]),
            );
          }
        }
      }
    });
    this.addContainedResources(...resourcesToAdd);
  }

  public addContainedResources(...resources: Resource[]) {
    let someResourceUpdated = false;
    resources.forEach((resource) => {
      if (!this._contains.has(resource)) {
        someResourceUpdated = true;
        this._contains.add(resource);
        this.parentContainer?.addContainedResources(this);
      }
    });
    if (someResourceUpdated) {
      this.emitStateUpdate();
    }
  }

  public removeContainedResources(...resources: Resource[]) {
    let someResourceUpdated = false;
    resources.forEach((resource) => {
      if (this._contains.has(resource)) {
        someResourceUpdated = true;
        this._contains.delete(resource);
      }
    });
    if (someResourceUpdated) {
      this.emitStateUpdate();
    }
  }
}
