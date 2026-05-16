"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "gabai_visited";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Sets the first-visit cookie (used by middleware for the landing redirect),
 * increments the visitor count once per browser, and returns the current count.
 */
export async function markVisitedAndGetCount(): Promise<number> {
	const cookieStore = await cookies();
	const supabase = await createClient();

	if (!cookieStore.has(COOKIE_NAME)) {
		cookieStore.set(COOKIE_NAME, "true", {
			maxAge: COOKIE_MAX_AGE,
			path: "/",
			sameSite: "lax",
		});
		await supabase.rpc("increment_visitor_count");
	}

	const { data } = await supabase
		.from("site_stats")
		.select("visitor_count")
		.single();

	return data?.visitor_count ?? 0;
}
