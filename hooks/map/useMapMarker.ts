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
import type { MarkerClusterer } from "@googlemaps/markerclusterer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function attachToClustererOrMap(
	marker: google.maps.marker.AdvancedMarkerElement,
	clusterer: MarkerClusterer | null | undefined,
	map: google.maps.Map,
) {
	if (clusterer) {
		clusterer.addMarker(marker, false);
	} else {
		marker.map = map;
	}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMapMarker({
	map,
	listing,
	isSelected,
	onSelect,
	clusterer,
}: MapMarkerProps) {
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);
	const rootRef = useRef<Root | null>(null);

	// Keep latest prop values in refs so effects don't re-mount on every render.
	const onSelectRef = useRef(onSelect);
	const isSelectedRef = useRef(isSelected);
	const listingRef = useRef(listing);
	const clustererRef = useRef(clusterer);
	const mapRef = useRef(map);

	onSelectRef.current = onSelect;
	isSelectedRef.current = isSelected;
	listingRef.current = listing;
	clustererRef.current = clusterer;
	mapRef.current = map;

	// Stable render function — reads category from ref so it never needs to
	// change, which means neither effect that calls it needs it as a dep.
	const renderPin = useCallback((root: Root, selected: boolean) => {
		root.render(
			createElement(MapPin, {
				category: listingRef.current.category?.category_name ?? "school",
				isSelected: selected,
			}),
		);
	}, []);

	// ── Mount effect — runs only when map or listing_id changes ───────────────

	useEffect(() => {
		if (!map) return;
		let cancelled = false;

		const content = document.createElement("div");
		content.className =
			"transition-transform duration-200 ease-in-out transform-gpu";
		const root = createRoot(content);
		rootRef.current = root;
		renderPin(root, isSelectedRef.current ?? false);

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

			markerRef.current = marker;
			marker.addListener("gmp-click", () =>
				onSelectRef.current?.(listingRef.current),
			);
		});

		return () => {
			cancelled = true;
			if (markerRef.current) {
				removeMarkerFromClusterer(markerRef.current);
				removeMarker(markerRef.current);
				markerRef.current = null;
			}
			const root = rootRef.current;
			rootRef.current = null;
			queueMicrotask(() => root?.unmount());
		};
	}, [map, listing.listing_id, renderPin]);

	// ── Sync selected visual state ────────────────────────────────────────────

	useEffect(() => {
		if (!rootRef.current) return;
		renderPin(rootRef.current, isSelected ?? false);
	}, [isSelected, renderPin]);

	// ── Sync clusterer changes (e.g. directions toggled on/off) ───────────────

	useEffect(() => {
		const marker = markerRef.current;
		if (!marker || !mapRef.current) return;
		attachToClustererOrMap(marker, clustererRef.current, mapRef.current);
	}, [clusterer]);
}
