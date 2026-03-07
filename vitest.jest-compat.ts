import { vi } from "vitest";

// Keep legacy Jest test helpers working during migration.
globalThis.jest = vi as unknown as Record<string, unknown>;
