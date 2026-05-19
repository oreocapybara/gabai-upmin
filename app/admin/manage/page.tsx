import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ListingForm from "@/components/admin/ListingForm";
import { ListingFormSkeleton } from "@/components/admin/ListingFormSkeleton";

// Get categories for the dropdown
async function getCategories() {
	const supabase = await createClient();
	const { data: categories, error } = await supabase
		.from("Category")
		.select("category_id, category_name")
		.order("category_name");

	if (error) {
		console.error("Error fetching categories:", error);
		return [];
	}
	return categories || [];
}

// Get listing data if editing
async function getListing(listingId: string | null) {
	if (!listingId) return null;

	const supabase = await createClient();
	const { data: listing, error } = await supabase
		.from("Listing")
		.select("*")
		.eq("listing_id", listingId)
		.single();

	if (error) {
		console.error("Error fetching listing:", error);
		return null;
	}
	return listing;
}

// Wrapper component that uses searchParams
async function ManagePageContent({
	searchParams,
}: {
	searchParams: Promise<{ listing_id?: string }>;
}) {
	const params = await searchParams;
	const listingId = params.listing_id || null;

	// Check authentication
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const categories = await getCategories();
	const listing = await getListing(listingId);

	const isEditing = !!listing;

	return (
		<div className="max-w-4xl mx-auto">
			<ListingForm
				key={listingId ?? "create"}
				categories={categories}
				initialData={listing}
				isEditing={isEditing}
			/>
		</div>
	);
}

export default function ManagePage({
	searchParams,
}: {
	searchParams: Promise<{ listing_id?: string }>;
}) {
	return (
		<>
			<Suspense fallback={<ListingFormSkeleton />}>
				<ManagePageContent searchParams={searchParams} />
			</Suspense>
		</>
	);
}
