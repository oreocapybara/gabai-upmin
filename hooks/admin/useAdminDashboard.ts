import { useMemo, useState } from "react";
import { deleteListingAction } from "@/app/admin/actions";
import { showToast } from "@/components/ui/CustomToast";
import type { AdminListing } from "@/services/admin.service";

export function useAdminDashboard(
	initialListings: AdminListing[],
	onAfterChange?: () => void,
) {
	const [listings, setListings] = useState(initialListings);
	const [deleteTarget, setDeleteTarget] = useState<{
		id: number;
		name: string;
	} | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const filteredListings = useMemo(() => {
		const query = searchTerm.toLowerCase();
		return listings
			.filter((listing) => {
				const matchesSearch = listing.listing_name.toLowerCase().includes(query);
				const matchesCategory =
					selectedCategory === "all" ||
					listing.Category?.category_name === selectedCategory;
				return matchesSearch && matchesCategory;
			})
			.sort((a, b) => a.listing_name.localeCompare(b.listing_name));
	}, [listings, searchTerm, selectedCategory]);

	const categories = useMemo(() => {
		const names = listings
			.map((listing) => listing.Category?.category_name)
			.filter(Boolean) as string[];
		return ["all", ...new Set(names)];
	}, [listings]);

	const handleDelete = async () => {
		if (!deleteTarget) return;

		setIsDeleting(true);
		const targetId = deleteTarget.id;
		const result = await deleteListingAction(targetId);

		if (result?.error) {
			showToast.error("Failed to delete listing", result.error);
		} else {
			setListings((prev) => prev.filter((l) => l.listing_id !== targetId));
			onAfterChange?.();
		}

		setIsDeleting(false);
		setDeleteTarget(null);
	};

	return {
		listings,
		setListings,
		deleteTarget,
		setDeleteTarget,
		isDeleting,
		searchTerm,
		setSearchTerm,
		selectedCategory,
		setSelectedCategory,
		categories,
		filteredListings,
		handleDelete,
	};
}
