import { NextRequest, NextResponse } from "next/server";
import { findLink, incrementClicks } from "@/lib/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const link = findLink(code);

  if (!link) {
    return NextResponse.redirect(new URL("/?error=not_found", request.url));
  }

  incrementClicks(code);
  return NextResponse.redirect(link.originalUrl);
}
