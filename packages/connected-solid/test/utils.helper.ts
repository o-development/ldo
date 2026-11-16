export async function wait(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

export class MockResponse extends Response {
  constructor(
    body?: BodyInit | null,
    init?: ResponseInit & { url?: string; redirected?: boolean },
  ) {
    super(body, init);
    if (init?.url) Object.defineProperty(this, "url", { value: init.url });
    if (init?.redirected)
      Object.defineProperty(this, "redirected", { value: init.redirected });
  }
}
