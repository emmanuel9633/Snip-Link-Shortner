import { NextRequest, NextResponse } from "next/server";
import { readLinks, createLink } from "@/lib/store";

export async function GET() {
  const links = readLinks();
  return NextResponse.json({ links });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const link = createLink(normalizedUrl);
  return NextResponse.json({ link }, { status: 201 });
}
