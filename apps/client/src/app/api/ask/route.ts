import { askBackendStream } from "@/lib/ask";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: string };
    const question = body.question?.trim() ?? "";

    if (!question) {
      return new Response("Please type a question first.", { status: 400 });
    }

    return await askBackendStream(question);
  } catch {
    return new Response(
      "I couldn't connect right now. Please try again in a moment.",
      { status: 502 },
    );
  }
}
