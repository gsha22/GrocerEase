import "@testing-library/jest-dom";

// jsdom has no fetch — provide a default so tests can spyOn(global, "fetch").
globalThis.fetch =
  globalThis.fetch ??
  (jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({}),
    } as Response),
  ) as unknown as typeof fetch);

class MockEventSource {
  url: string;
  constructor(url: string) {
    this.url = url;
  }
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

// StoreFreshUpdatesFeed uses SSE in the browser
global.EventSource = MockEventSource as unknown as typeof EventSource;
