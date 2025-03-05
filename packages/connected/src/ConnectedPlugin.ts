import type { Resource } from "./Resource";

export interface ConnectedPlugin {
  name: string;
  getResource(uri: string): Resource;
}
