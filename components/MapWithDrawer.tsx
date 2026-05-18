"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Map from "@/components/map/Map";
import { MainDrawer } from "@/components/drawer/MainDrawer";
import type { Category, ListingWithCategory } from "@/types";

interface MapWithDrawerProps {
	initialListings: ListingWithCategory[];
	categories: Category[];
}

export function MapWithDrawer({
	initialListings,
	categories,
}: MapWithDrawerProps) {
	const searchParams = useSearchParams();
	const [drawerSnapState, setDrawerSnapState] = useState(0);
	const [directionsListing, setDirectionsListing] =
		useState<ListingWithCategory | null>(null);
	const [selectedListing, setSelectedListing] =
		useState<ListingWithCategory | null>(null);
	const [selectionSource, setSelectionSource] = useState<"pin" | "list" | null>(
		null,
	);

	const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();
	const categoryParam = searchParams.get("category") ?? "";
	const initialCategoryId = categoryParam
		? String(categories.find((c) => c.category_name === categoryParam)?.category_id ?? "")
		: "";

	const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);

	const selectedCategoryName = useMemo(
		() => categories.find((c) => String(c.category_id) === selectedCategoryId)?.category_name ?? "",
		[categories, selectedCategoryId],
	);

	const handleCategoryChange = useCallback((categoryId: string) => {
		setSelectedCategoryId(categoryId);
	}, []);
	const filteredListings = useMemo(() => {
		if (!searchQuery) return initialListings;
		const matches = initialListings.filter((listing) => {
			const name = listing.listing_name.toLowerCase();
			const category = listing.category?.category_name?.toLowerCase() ?? "";
			return name.includes(searchQuery) || category.includes(searchQuery);
		});

		const extras: ListingWithCategory[] = [];
		[selectedListing, directionsListing].forEach((listing) => {
			if (!listing) return;
			if (!matches.some((l) => l.listing_id === listing.listing_id)) {
				extras.push(listing);
			}
		});

		return [...extras, ...matches];
	}, [directionsListing, initialListings, searchQuery, selectedListing]);

	const handleDirections = useCallback((listing: ListingWithCategory) => {
		setDirectionsListing((prev) => {
			const isStopping = prev?.listing_id === listing.listing_id;
			if (isStopping) {
				setSelectionSource(null);
				return null;
			}
			setSelectedListing(listing);
			setSelectionSource("list");
			return listing;
		});
	}, []);

	const handleSelectListing = useCallback(
		(listing: ListingWithCategory) => {
			if (
				directionsListing &&
				listing.listing_id === directionsListing.listing_id
			) {
				setSelectedListing(listing);
				setSelectionSource("pin");
				return;
			}
			setSelectedListing((prev) =>
				prev?.listing_id === listing.listing_id ? null : listing,
			);
			setSelectionSource("pin");
		},
		[directionsListing],
	);

	useEffect(() => {
		if (drawerSnapState === 0 && !directionsListing) {
			setSelectedListing(null);
		}
	}, [drawerSnapState, directionsListing]);

	return (
		<>
			<Map
				initialListings={filteredListings}
				directionsListing={directionsListing}
				selectedListingId={selectedListing?.listing_id ?? null}
				onSelectListing={handleSelectListing}
				drawerSnapState={drawerSnapState}
				selectedCategoryName={selectedCategoryName}
			/>
			<MainDrawer
				listings={filteredListings}
				categories={categories}
				onDirections={handleDirections}
				selectedListing={selectedListing}
				onSelectListing={handleSelectListing}
				directionsListing={directionsListing}
				onSnapChange={setDrawerSnapState}
				searchQuery={searchQuery}
				selectionSource={selectionSource}
				initialCategoryId={initialCategoryId}
				selectedCategoryId={selectedCategoryId}
				onCategoryChange={handleCategoryChange}
			/>
		</>
	);
}
