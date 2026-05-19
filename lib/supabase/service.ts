import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS.
 * Only use in trusted server-side code (Server Actions, Route Handlers).
 * Never import this in client components or expose the key to the browser.
 */
export function createServiceClient() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);
}
