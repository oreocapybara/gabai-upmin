import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export type AdminListing = {
	listing_id: number;
	listing_name: string;
	coord_latitude: number;
	coord_longitude: number;
	image_url: string | null;
	image_path: string | null; // ✅ add this
	opening_hours: string | null;
	closing_hours: string | null;
	price_min: number | null;
	price_max: number | null;
	description: string | null;
	category_id: number;
	Category: { category_id: number; category_name: string } | null;
};

export type AdminLogEntry = {
	log_id: number;
	status: "CREATED_LISTING" | "UPDATED_LISTING" | "DELETED_LISTING" | null;
	listing_id: number | null;
	listing_name: string | null;
	admin_id: number;
	Listing: { listing_name: string } | null;
	Admin: { username: string | null; email: string | null } | null;
};
export async function getCategories(): Promise<{ category_id: number; category_name: string }[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("Category")
		.select("category_id, category_name")
		.order("category_id", { ascending: true });

	if (error) {
		console.error("Error fetching categories:", error);
		return [];
	}
	return data ?? [];
}

export async function getAdminListings(): Promise<AdminListing[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("Listing")
		.select(
			"listing_id, listing_name, coord_latitude, coord_longitude, image_url, image_path, opening_hours, closing_hours, price_min, price_max, description, category_id, Category(category_id, category_name)",
		)
		.order("listing_id", { ascending: false });

	if (error) {
		console.error("Error fetching listings:", error);
		return [];
	}

	return (data ?? []) as unknown as AdminListing[];
}

export async function getRecentAdminLogs(limit = 15): Promise<AdminLogEntry[]> {
	// Service-role client bypasses RLS so Admin_Log + Admin join reads always succeed
	const supabase = createServiceClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);
	const { data, error } = await supabase
		.from("Admin_Log")
		.select(
			"log_id, status, listing_id, listing_name, admin_id, Listing(listing_name), Admin(username, email)",
		)
		.order("log_id", { ascending: false })
		.limit(limit);

	if (error) {
		console.error("Error fetching admin logs:", error);
		return [];
	}

	return (data ?? []) as unknown as AdminLogEntry[];
}
