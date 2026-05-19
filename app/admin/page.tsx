import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { AdminDashboardSkeleton } from "@/components/admin/AdminDashboardSkeleton";
import { Suspense } from "react";
import { connection } from "next/server";
import { getAdminListings, getCategories, getRecentAdminLogs } from "@/services/admin.service";

async function AdminPageContent() {
	await connection();

	const [listings, categories, recentLogs] = await Promise.all([
		getAdminListings(),
		getCategories(),
		getRecentAdminLogs(15),
	]);

	return (
		<AdminDashboardClient initialListings={listings} categories={categories} recentLogs={recentLogs} />
	);
}

export default function AdminPage() {
	return (
		<Suspense fallback={<AdminDashboardSkeleton />}>
			<AdminPageContent />
		</Suspense>
	);
}
