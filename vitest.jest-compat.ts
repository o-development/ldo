import { vi } from "vitest";

// Keep legacy Jest test helpers working during migration.
globalThis.jest = vi as unknown as Record<string, unknown>;

// vitest and jsdom don't play well together
// browser and Node have different Uint8Array instances, leading to error in Jose library.
// here, we loosen the instanceof Uint8Array check.
if (typeof globalThis !== "undefined") {
  // Keep Node's Uint8Array for reference
  const NodeUint8Array = globalThis.__node_uint8array__ ?? Uint8Array;
  globalThis.__node_uint8array__ ??= NodeUint8Array;

  // overwrite the instanceof check with a more loose check so both instances pass the comparison
  Object.defineProperty(NodeUint8Array, Symbol.hasInstance, {
    value(instance: unknown) {
      if (!instance) return false;
      return (
        instance.constructor?.name === "Uint8Array" ||
        Object.prototype.toString.call(instance) === "[object Uint8Array]"
      );
    },
    configurable: true,
  });
}
