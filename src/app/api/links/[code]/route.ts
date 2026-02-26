import { NextRequest, NextResponse } from "next/server";
import { incrementClicks, findLink } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const link = findLink(code);
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  return NextResponse.json({ link });
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const updated = incrementClicks(code);
  if (!updated) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  return NextResponse.json({ link: updated });
}
