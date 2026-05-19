import { useEffect, useMemo, useState } from "react";
import { deleteListingAction } from "@/app/admin/actions";
import type { AdminListing } from "@/services/admin.service";

export type NotifyFn = (message: string, variant: "success" | "error") => void;

export function useAdminDashboard(
	initialListings: AdminListing[],
	onAfterChange?: () => void,
	notify?: NotifyFn,
) {
	const [listings, setListings] = useState(initialListings);

	useEffect(() => {
		setListings(initialListings);
	}, [initialListings]);

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
		const targetName = deleteTarget.name;
		const result = await deleteListingAction(targetId);

		if (result?.error) {
			notify?.(`Failed to delete "${targetName}": ${result.error}`, "error");
		} else {
			setListings((prev) => prev.filter((l) => l.listing_id !== targetId));
			notify?.(`"${targetName}" was deleted.`, "success");
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
