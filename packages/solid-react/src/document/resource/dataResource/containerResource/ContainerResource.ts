import { ContainerShapeType } from "../../../../ldo/solid.shapeTypes";
import { Resource } from "../../Resource";
import { BinaryResourceStore } from "../../binaryResource/BinaryResourceStore";
import { DataResource, DataResourceDependencies } from "../DataResource";
import { DataResourceStore } from "../DataResourceStore";

export interface ContainerResourceDependencies
  extends DataResourceDependencies {
  dataResourceStore: DataResourceStore;
  binaryResourceStore: BinaryResourceStore;
}

export class ContainerResource extends DataResource {
  private _contains: Set<Resource>;
  private dependencies3: ContainerResourceDependencies;

  constructor(uri: string, dependencies: ContainerResourceDependencies) {
    super(uri, dependencies);
    this._contains = new Set();
    this.dependencies3 = dependencies;
  }

  /**
   * ===========================================================================
   * Getters
   * ===========================================================================
   */
  get contains() {
    return Array.from(this._contains);
  }

  protected get binaryResourceStore() {
    return this.dependencies3.binaryResourceStore;
  }

  protected get dataResourceStore() {
    return this.dependencies3.dataResourceStore;
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
    const container = this.dataset
      .usingType(ContainerShapeType)
      .fromSubject(this.uri);
    const resourcesToAdd: Resource[] = [];
    container.contains?.forEach((resourceData) => {
      if (resourceData["@id"]) {
        if (resourceData.type?.some((type) => type["@id"] === "Container")) {
          resourcesToAdd.push(
            this.containerResourceStore.get(resourceData["@id"])
          );
        } else {
          if (resourceData["@id"].endsWith(".ttl")) {
            resourcesToAdd.push(
              this.dataResourceStore.get(resourceData["@id"])
            );
          } else {
            resourcesToAdd.push(
              this.binaryResourceStore.get(resourceData["@id"])
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
