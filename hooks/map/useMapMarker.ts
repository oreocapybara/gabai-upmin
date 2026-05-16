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
		// addMarker is safe to call even if the marker is already present —
		// MarkerClusterer deduplicates internally.
		clusterer.addMarker(marker, false);
	} else {
		marker.map = map;
	}
}

function detachFromClustererOrMap(
	marker: google.maps.marker.AdvancedMarkerElement,
	clusterer: MarkerClusterer | null | undefined,
) {
	if (clusterer) {
		// Remove from the clusterer so the marker no longer contributes to
		// cluster counts and its icon is not shown on the map.
		clusterer.removeMarker(marker, false);
	} else {
		marker.map = null;
	}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

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

	// Keep latest prop values in refs so effects don't need them as deps
	// (avoids unnecessary remounts).
	const onSelectRef = useRef(onSelect);
	const isSelectedRef = useRef(isSelected);
	const listingRef = useRef(listing);
	const clustererRef = useRef(clusterer);
	const isHiddenRef = useRef(isHidden);
	const mapRef = useRef(map);

	onSelectRef.current = onSelect;
	isSelectedRef.current = isSelected;
	listingRef.current = listing;
	clustererRef.current = clusterer;
	isHiddenRef.current = isHidden;
	mapRef.current = map;

	const getCategoryName = useCallback(
		() => listing.category?.category_name ?? "school",
		[listing.category?.category_name],
	);

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
	renderPinRef.current = renderPin;

	// ── Mount effect — runs only when map or listing_id changes ───────────────

	useEffect(() => {
		if (!map) return;
		let cancelled = false;

		const content = document.createElement("div");
		content.className =
			"transition-transform duration-200 ease-in-out transform-gpu";
		const root = createRoot(content);
		rootRef.current = root;
		renderPinRef.current(root, isSelectedRef.current ?? false);

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

			// If the marker was supposed to be hidden before it finished creating,
			// detach it now so it doesn't appear in the clusterer or on the map.
			if (isHiddenRef.current) {
				detachFromClustererOrMap(marker, clustererRef.current);
			}

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
	}, [map, listing.listing_id]);

	// ── Sync selected visual state ────────────────────────────────────────────

	useEffect(() => {
		if (!rootRef.current) return;
		renderPin(rootRef.current, isSelected ?? false);
	}, [isSelected, renderPin]);

	// ── Sync visibility — removes / re-adds from clusterer or map ─────────────
	//
	// This is the key fix: previously we only changed CSS opacity, which meant
	// the marker was still part of the clusterer and contributed to cluster
	// counts. Now we properly detach / re-attach the marker so clusters
	// disappear completely when a route is active.

	useEffect(() => {
		const marker = markerRef.current;
		if (!marker) return; // marker not yet created (async) — handled at creation time above

		if (isHidden) {
			detachFromClustererOrMap(marker, clustererRef.current);
		} else {
			if (mapRef.current) {
				attachToClustererOrMap(marker, clustererRef.current, mapRef.current);
			}
		}
	}, [isHidden]);

	// ── Sync clusterer changes (e.g., directions toggled off) ─────────────────

	useEffect(() => {
		const marker = markerRef.current;
		if (!marker) return;
		if (isHiddenRef.current) {
			detachFromClustererOrMap(marker, clustererRef.current);
			return;
		}
		if (mapRef.current) {
			attachToClustererOrMap(marker, clustererRef.current, mapRef.current);
		}
	}, [clusterer]);
}
