import { NextRequest } from "next/server";
import { subscribeToPostEvents, type PostEventPayload } from "@/lib/post-events";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function toSseMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: storeId } = await context.params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(toSseMessage("ready", { storeId, ok: true })),
      );

      const onPostEvent = (payload: PostEventPayload) => {
        controller.enqueue(encoder.encode(toSseMessage("post-event", payload)));
      };

      const unsubscribe = subscribeToPostEvents(storeId, onPostEvent);
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

      const cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };

      request.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      // cleanup is handled by request abort listener
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
