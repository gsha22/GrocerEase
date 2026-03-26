import { EventEmitter } from "node:events";

export type PostEventType = "POST_CREATE" | "POST_UPDATE" | "POST_DELETE";

export type PostEventPayload = {
  storeId: string;
  postId: string;
  type: PostEventType;
  occurredAt: string;
};

const POST_EVENTS_KEY = Symbol.for("grocerease.post-events.bus");

type GlobalWithPostBus = typeof globalThis & {
  [POST_EVENTS_KEY]?: EventEmitter;
};

function getPostEventBus() {
  const g = globalThis as GlobalWithPostBus;
  if (!g[POST_EVENTS_KEY]) {
    const bus = new EventEmitter();
    bus.setMaxListeners(0);
    g[POST_EVENTS_KEY] = bus;
  }
  return g[POST_EVENTS_KEY];
}

export function broadcastPostEvent(event: Omit<PostEventPayload, "occurredAt">) {
  const payload: PostEventPayload = {
    ...event,
    occurredAt: new Date().toISOString(),
  };
  getPostEventBus().emit(event.storeId, payload);
}

export function subscribeToPostEvents(
  storeId: string,
  listener: (payload: PostEventPayload) => void,
) {
  const bus = getPostEventBus();
  bus.on(storeId, listener);
  return () => {
    bus.off(storeId, listener);
  };
}
