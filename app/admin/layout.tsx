import { Suspense } from "react";
import { AdminDashboardSkeleton } from "@/components/admin/AdminDashboardSkeleton";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminSessionExpired } from "@/lib/admin-session";

async function requireAdmin() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	if (isAdminSessionExpired(user.last_sign_in_at)) {
		redirect("/auth/signout?reason=session_expired");
	}

	const role = user.app_metadata?.role ?? user.user_metadata?.role;
	if (role === "admin") return;

	if (user.email) {
		const { data, error } = await supabase.rpc("is_admin_email", {
			p_email: user.email,
		});
		if (!error && data) return;
	}

	redirect("/admin/unauthorized");
}

async function AdminGate({ children }: { children: React.ReactNode }) {
	await requireAdmin();
	return children;
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Suspense fallback={<AdminDashboardSkeleton />}>
				<AdminGate>{children}</AdminGate>
			</Suspense>
		</>
	);
}
