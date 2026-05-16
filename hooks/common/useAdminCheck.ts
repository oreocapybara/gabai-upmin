import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useAdminCheck(): boolean {
	const [isAdmin, setIsAdmin] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		let isMounted = true;

		const resolveIsAdmin = async (user: User | null): Promise<boolean> => {
			if (!user) return false;
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

		const updateFromUser = async (user: User | null) => {
			const resolved = await resolveIsAdmin(user);
			if (isMounted) setIsAdmin(resolved);
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
				void updateFromUser(session?.user ?? null);
			},
		);

		return () => {
			isMounted = false;
			authListener.subscription.unsubscribe();
		};
	}, [supabase]);

	return isAdmin;
}
