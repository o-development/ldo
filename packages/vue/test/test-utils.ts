import type { Resource } from "@ldo/connected";
import { vi } from "vitest";
import {
  createApp,
  type MultiWatchSources,
  watch,
  type App,
  type WatchSource,
} from "vue";

/**
 * https://vuejs.org/guide/scaling-up/testing.html#testing-composables
 */
export function withSetup<T>(composable: () => T): [T, App<Element>] {
  let result!: T;
  const app = createApp({
    setup() {
      result = composable();
      // suppress missing template warning
      return () => {};
    },
  });
  app.mount(document.createElement("div"));
  // return the result and the app instance
  // for testing provide/unmount
  return [result, app];
}

/**
 * This counts how many times the reference or references updated.
 * Constructor accepts any parameter that fits vue's watch source/sources parameter.
 *
 * https://vuejs.org/api/reactivity-core.html#watch
 */
type AllowedSources =
  | WatchSource
  | MultiWatchSources
  | Readonly<MultiWatchSources>;
export class RerenderCount {
  private _count = 0;

  constructor(sources: AllowedSources) {
    watch(sources, () => {
      this._count++;
      console.log("RERENDER", this._count);
    });
  }

  public get count() {
    return this._count;
  }

  public clearCount() {
    this._count = 0;
  }
}

export async function waitForResource(resource: Resource) {
  await vi.waitFor(() => {
    if (!resource.isFetched()) {
      throw new Error("not fetched yet");
    }
  });
}
