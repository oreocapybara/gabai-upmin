import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  const reason = request.nextUrl.searchParams.get("reason");
  url.search = reason ? `?reason=${encodeURIComponent(reason)}` : "";

  return NextResponse.redirect(url);
}
