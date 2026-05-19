import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const invitedEmail = searchParams.get("invited_email");
  const next = searchParams.get("next") ?? "/admin";
  const safeNext = next.startsWith("/") ? next : "/admin";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/unauthorized`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/admin/unauthorized`);
  }

  if (invitedEmail) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email?.toLowerCase() !== invitedEmail.toLowerCase()) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/unauthorized`);
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
