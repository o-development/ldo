import type { DocumentError } from "../../errors/DocumentError";
import type { ResourceDependencies } from "../Resource";
import { Resource } from "../Resource";

export declare type BinaryResourceDependencies = ResourceDependencies;

export class BinaryResource extends Resource {
  fetchDocument(): Promise<DocumentError | undefined> {
    throw new Error("Method not implemented.");
  }
}
