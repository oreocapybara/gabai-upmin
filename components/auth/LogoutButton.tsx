"use client";

import { createClient } from "@/lib/supabase/client";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function LogoutButton({ className, variant, size }: ButtonProps) {
	const router = useRouter();

	const logout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push("/");
	};

	return (
		<Button
			onClick={logout}
			className={className}
			variant={variant}
			size={size}
		>
			Logout
		</Button>
	);
}
