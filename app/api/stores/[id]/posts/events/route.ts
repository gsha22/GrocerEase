import { NextRequest, NextResponse } from "next/server";
import { subscribeToPostEvents } from "@/lib/post-events";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: storeId } = await context.params;
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let keepAlive: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const write = (chunk: string) => {
        controller.enqueue(encoder.encode(chunk));
      };

      write("retry: 3000\n\n");

      unsubscribe = subscribeToPostEvents((event) => {
        if (event.storeId !== storeId) return;
        write(`event: ${event.type}\n`);
        write(`data: ${JSON.stringify(event)}\n\n`);
      });

      keepAlive = setInterval(() => {
        write(": keep-alive\n\n");
      }, 25_000);
    },
    cancel() {
      if (keepAlive) clearInterval(keepAlive);
      if (unsubscribe) unsubscribe();
    },
  });

  return new NextResponse(stream, { headers: sseHeaders() });
}
