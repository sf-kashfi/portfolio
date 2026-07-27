import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const resumePath = path.join(process.cwd(), "Fatemeh-Kashfi.pdf");

  try {
    const resume = await readFile(resumePath);
    return new NextResponse(new Uint8Array(resume), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="Fatemeh-Kashfi.pdf"',
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Resume unavailable" }, { status: 404 });
  }
}
