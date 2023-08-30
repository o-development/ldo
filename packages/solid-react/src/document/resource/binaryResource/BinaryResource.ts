import { DocumentError } from "../../errors/DocumentError";
import { Resource, ResourceDependencies } from "../Resource";

export declare type BinaryResourceDependencies = ResourceDependencies;

export class BinaryResource extends Resource {
  fetchDocument(): Promise<DocumentError | undefined> {
    throw new Error("Method not implemented.");
  }
}
