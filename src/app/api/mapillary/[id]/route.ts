import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ID_RE = /^\d{5,}$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!ID_RE.test(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  const token = process.env.MAPILLARY_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "mapillary unset" }, { status: 404 });
  }

  const meta = await fetch(
    `https://graph.mapillary.com/${id}?fields=thumb_1024_url`,
    {
      headers: { Authorization: `OAuth ${token}` },
      cache: "force-cache",
      next: { revalidate: 86400 },
    },
  );
  if (!meta.ok) {
    return NextResponse.json({ error: "image not found" }, { status: meta.status });
  }
  const payload = (await meta.json()) as { thumb_1024_url?: string };
  const thumb = payload.thumb_1024_url;
  if (!thumb) {
    return NextResponse.json({ error: "no thumbnail" }, { status: 404 });
  }

  const image = await fetch(thumb, { cache: "force-cache" });
  if (!image.ok || !image.body) {
    return NextResponse.json({ error: "thumb fetch failed" }, { status: 502 });
  }

  return new NextResponse(image.body, {
    status: 200,
    headers: {
      "Content-Type": image.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
