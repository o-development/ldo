import { useState, useCallback } from "react";

export function useForceReload() {
  const [, setValue] = useState(0);
  return useCallback(() => setValue((value) => value + 1), []);
}
