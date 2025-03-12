import type { Resource } from "./Resource";

export interface ConnectedPlugin {
  name: string;
  getResource(uri: string): Resource;
  createResource(): Promise<Resource>;
  isUriValid(uri: string): boolean;
  normalizeUri?: (uri: string) => string;
}
