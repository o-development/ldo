import { SolidLdoError } from "../../error/SolidLdoError";
import { PotentialDataResource } from "../dataResource/potentialDataResource";

export class Container extends PotentialDataResource {
  async read(): Promise<FetchedLeafClass | SolidLdoError> {
    // Make query
    // Select the Kind of Leaf
    // Create it

    // Post Processing
    throw new Error("Not Implemented");
  }
}
