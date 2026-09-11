// https://vuejs.org/guide/scaling-up/testing.html#testing-composables

import { createApp, type App } from "vue";

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
