import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_SESSION_DURATION_MS, isAdminSessionExpired } from "@/lib/admin-session";

export function useAdminCheck(): boolean {
	const [isAdmin, setIsAdmin] = useState(false);
	const supabase = createClient();
	const router = useRouter();

	const handleSessionExpiry = useCallback(async () => {
		await supabase.auth.signOut();
		router.push("/login?reason=session_expired");
	}, [supabase, router]);

	useEffect(() => {
		let isMounted = true;
		let expiryTimer: ReturnType<typeof setTimeout> | null = null;

		const resolveIsAdmin = async (user: User | null): Promise<boolean> => {
			if (!user) return false;

			if (isAdminSessionExpired(user.last_sign_in_at)) {
				void handleSessionExpiry();
				return false;
			}

			const role =
				(user.app_metadata?.role as string | undefined) ??
				(user.user_metadata?.role as string | undefined);
			if (role) return role === "admin";

			if (user.email) {
				const { data, error } = await supabase.rpc("is_admin_email", {
					p_email: user.email,
				});
				if (!error) return Boolean(data);
			}

			return false;
		};

		const scheduleExpiryTimer = (user: User | null) => {
			if (!user?.last_sign_in_at) return;
			const elapsed = Date.now() - new Date(user.last_sign_in_at).getTime();
			const remaining = ADMIN_SESSION_DURATION_MS - elapsed;
			if (remaining > 0) {
				expiryTimer = setTimeout(() => {
					if (isMounted) void handleSessionExpiry();
				}, remaining);
			}
		};

		const updateFromUser = async (user: User | null) => {
			const resolved = await resolveIsAdmin(user);
			if (isMounted) {
				setIsAdmin(resolved);
				if (resolved) scheduleExpiryTimer(user);
			}
		};

		const check = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			await updateFromUser(user);
		};

		void check();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				if (expiryTimer) {
					clearTimeout(expiryTimer);
					expiryTimer = null;
				}
				void updateFromUser(session?.user ?? null);
			},
		);

		return () => {
			isMounted = false;
			if (expiryTimer) clearTimeout(expiryTimer);
			authListener.subscription.unsubscribe();
		};
	}, [supabase, handleSessionExpiry]);

	return isAdmin;
}
