import type { Resource } from "./Resource";

export interface ConnectedLdoPlugin {
  name: string;
  getResource(uri: string): Resource;
}
