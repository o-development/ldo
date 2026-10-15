import { createApp, h, type App } from "vue";

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
 * modified test setup for composables in parent/child relationship (e.g. provide/inject)
 */
export function withParentChildSetup<P, C>(
  parentComposable: () => P,
  childComposable: () => C,
): [P, C, App<Element>] {
  let parentResult!: P;
  let childResult!: C;

  const app = createApp({
    setup() {
      parentResult = parentComposable();
      return () =>
        h({
          setup() {
            childResult = childComposable();
            return () => {};
          },
        });
    },
  });

  app.mount(document.createElement("div"));
  return [parentResult, childResult, app];
}

export class MockSharedWorker implements SharedWorker {
  port: MessagePort;
  onerror = null;

  constructor(_url, _options) {
    this.port = {
      onmessage: null,
    } as MessagePort;
  }
  addEventListener(
    _type: unknown,
    _listener: unknown,
    _options?: unknown,
  ): void {
    throw new Error("Method not implemented.");
  }
  removeEventListener(
    _type: unknown,
    _listener: unknown,
    _options?: unknown,
  ): void {
    throw new Error("Method not implemented.");
  }
  dispatchEvent(_event: Event): boolean {
    throw new Error("Method not implemented.");
  }
}
