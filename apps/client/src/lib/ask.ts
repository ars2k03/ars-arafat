import type { AskResponse, AskResult } from "@/types/chat";

const ASK_API_URL = process.env.ASK_API_URL ?? "http://localhost:8000/ask";
const ASK_STREAM_URL =
  process.env.ASK_STREAM_URL ?? "http://localhost:8000/ask/stream";

export async function askBackend(question: string): Promise<AskResult> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { ok: false, error: "Please type a question first." };
  }

  try {
    const response = await fetch(ASK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: trimmed }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        error: "Something went wrong while getting a reply. Please try again.",
      };
    }

    const data = (await response.json()) as Partial<AskResponse>;
    const answer = data.answer?.trim();

    if (!answer) {
      return {
        ok: false,
        error: "I couldn't generate a reply. Please try asking again.",
      };
    }

    return { ok: true, answer, images: data.images ?? [] };
  } catch {
    return {
      ok: false,
      error: "I couldn't connect right now. Please try again in a moment.",
    };
  }
}

export async function askBackendStream(question: string): Promise<Response> {
  const trimmed = question.trim();
  if (!trimmed) {
    return new Response("Please type a question first.", { status: 400 });
  }

  const upstream = await fetch(ASK_STREAM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
    },
    body: JSON.stringify({ question: trimmed }),
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(
      "Something went wrong while getting a reply. Please try again.",
      { status: upstream.status || 502 },
    );
  }

  const reader = upstream.body.getReader();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        controller.error(error);
        reader.cancel().catch(() => undefined);
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
