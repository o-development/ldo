import { SetProxy } from "./setProxy";

export function isSetProxy(someObject?: unknown): someObject is SetProxy {
  if (!someObject) return false;
  if (typeof someObject !== "object") return false;
  return someObject instanceof SetProxy;
}
