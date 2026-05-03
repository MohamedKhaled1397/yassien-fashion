import { NextResponse } from "next/server";
import { readSiteSocial } from "@/lib/site-social";

export async function GET() {
  const social = await readSiteSocial();
  return NextResponse.json(social);
}
