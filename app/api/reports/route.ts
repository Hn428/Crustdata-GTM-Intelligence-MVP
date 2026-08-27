import { savePublicReport } from "@/lib/publication/report-store";

const MAX_REQUEST_BYTES = 150_000;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "Report payload is too large." }, { status: 413 });
  }

  try {
    const report = savePublicReport(await request.json());
    return Response.json(
      { slug: report.slug },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "The sanitized report payload is invalid." }, { status: 400 });
  }
}
