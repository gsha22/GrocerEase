type PostEventType = "POST_UPDATE" | "POST_DELETE";

export interface PostEventPayload {
  type: PostEventType;
  storeId: string;
  postId: string;
  occurredAt: string;
}

type PostEventListener = (event: PostEventPayload) => void;

interface PostEventHub {
  listeners: Set<PostEventListener>;
}

declare global {
  var __postEventHub: PostEventHub | undefined;
}

function hub(): PostEventHub {
  if (!globalThis.__postEventHub) {
    globalThis.__postEventHub = { listeners: new Set<PostEventListener>() };
  }
  return globalThis.__postEventHub;
}

export function subscribeToPostEvents(listener: PostEventListener): () => void {
  const current = hub();
  current.listeners.add(listener);
  return () => {
    current.listeners.delete(listener);
  };
}

export function publishPostEvent(event: Omit<PostEventPayload, "occurredAt">): void {
  const payload: PostEventPayload = {
    ...event,
    occurredAt: new Date().toISOString(),
  };
  const current = hub();
  for (const listener of current.listeners) {
    listener(payload);
  }
}
