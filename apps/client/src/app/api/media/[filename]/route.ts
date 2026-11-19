import { NextRequest } from "next/server";

const MEDIA_API_BASE =
  process.env.MEDIA_API_BASE ?? "http://localhost:8000/media";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { filename } = await context.params;
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "");

  if (!safeName || safeName !== filename) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const upstream = await fetch(
      `${MEDIA_API_BASE}/${encodeURIComponent(safeName)}`,
      {
        cache: "force-cache",
      },
    );

    if (!upstream.ok || !upstream.body) {
      return new Response("Not found", { status: upstream.status || 404 });
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 502 });
  }
}
