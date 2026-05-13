import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAdminCheck(): boolean {
	const [isAdmin, setIsAdmin] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		const check = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user?.app_metadata?.role === "admin") setIsAdmin(true);
		};
		check();
	}, [supabase]);

	return isAdmin;
}
