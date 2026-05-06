import { useCallback, useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { createElement } from "react";
import MapPin from "@/components/map/MapPin";
import {
	createAdvancedMarker,
	removeMarker,
} from "@/services/map/mapMarker.service";
import { removeMarkerFromClusterer } from "@/services/map/markerClusterer.service";
import { MapMarkerProps } from "@/components/map/MapMarker";

// This file renders map markers when called
export function useMapMarker({
	map,
	listing,
	isSelected,
	onSelect,
	clusterer,
	isHidden,
}: MapMarkerProps) {
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);
	const rootRef = useRef<Root | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	// Refs for values used inside mount effect that shouldn't trigger remount
	const onSelectRef = useRef(onSelect);
	const isSelectedRef = useRef(isSelected);
	const listingRef = useRef(listing);
	const clustererRef = useRef(clusterer); // ← was missing
	const isHiddenRef = useRef(isHidden);

	// Keep refs in sync every render
	onSelectRef.current = onSelect;
	isSelectedRef.current = isSelected;
	listingRef.current = listing;
	clustererRef.current = clusterer; // ← keep in sync
	isHiddenRef.current = isHidden;

	const getCategoryName = useCallback(() => {
		return listing.category?.category_name ?? "school";
	}, [listing.category?.category_name]);

	const renderPin = useCallback(
		(root: Root, selected: boolean) => {
			root.render(
				createElement(MapPin, {
					category: getCategoryName(),
					isSelected: selected,
				}),
			);
		},
		[getCategoryName],
	);

	const renderPinRef = useRef(renderPin);
	renderPinRef.current = renderPin; // keep in sync every render

	// Mount marker, only remounts when map or listing_id changes
	useEffect(() => {
		if (!map) return;
		let cancelled = false;

		const content = document.createElement("div");
		contentRef.current = content;
		content.className = "transition-all duration-200 ease-in-out transform-gpu";
		content.style.opacity = isHiddenRef.current ? "0" : "1";
		content.style.pointerEvents = isHiddenRef.current ? "none" : "auto";
		content.style.transform = isHiddenRef.current ? "scale(0.95)" : "scale(1)";
		const root = createRoot(content);
		rootRef.current = root;
		renderPinRef.current(root, isSelectedRef.current ?? false); // ← ref, not renderPin directly

		const { coord_latitude, coord_longitude, listing_name } =
			listingRef.current;

		createAdvancedMarker(
			map,
			{ lat: coord_latitude, lng: coord_longitude },
			listing_name,
			content,
			clustererRef.current ?? undefined,
		).then((marker) => {
			if (cancelled) {
				removeMarkerFromClusterer(marker);
				removeMarker(marker);
				return;
			}
			marker.addListener("gmp-click", () =>
				onSelectRef.current?.(listingRef.current),
			);
			markerRef.current = marker;
		});

		return () => {
			cancelled = true;
			if (markerRef.current) {
				removeMarkerFromClusterer(markerRef.current); // ← remove from cluster too
				removeMarker(markerRef.current);
				markerRef.current = null;
			}
			const root = rootRef.current;
			rootRef.current = null;
			queueMicrotask(() => root?.unmount());
		};
	}, [map, listing.listing_id]); // ← renderPin removed

	// Sync selected state
	useEffect(() => {
		if (!rootRef.current) return;
		renderPin(rootRef.current, isSelected ?? false);
	}, [isSelected, renderPin]);

	useEffect(() => {
		if (!contentRef.current) return;
		contentRef.current.style.opacity = isHidden ? "0" : "1";
		contentRef.current.style.pointerEvents = isHidden ? "none" : "auto";
		contentRef.current.style.transform = isHidden ? "scale(0.95)" : "scale(1)";
	}, [isHidden]);
}
