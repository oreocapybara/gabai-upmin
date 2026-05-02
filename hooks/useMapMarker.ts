import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { createElement } from "react";
import MapPin from "@/components/map/MapPin";
import {
	createAdvancedMarker,
	removeMarker,
} from "@/services/mapMarker.service";
import { MapMarkerProps } from "@/components/map/MapMarker";

export function useMapMarker({
	map,
	listing,
	isSelected,
	onSelect,
}: MapMarkerProps) {
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);
	const rootRef = useRef<Root | null>(null);
	const onSelectRef = useRef(onSelect); // ← stable ref

	// Keep ref in sync without triggering effects
	useEffect(() => {
		onSelectRef.current = onSelect;
	}, [onSelect]);

	const getCategoryName = () => listing.category?.category_name ?? "default";

	const renderPin = (root: Root, selected: boolean) => {
		root.render(
			createElement(MapPin, {
				category: getCategoryName(),
				isSelected: selected,
			}),
		);
	};

	// Mount marker — onSelect removed from deps
	useEffect(() => {
		if (!map) return;

		const content = document.createElement("div");
		const root = createRoot(content);
		rootRef.current = root;
		renderPin(root, isSelected ?? false);

		createAdvancedMarker(
			map,
			{ lat: listing.coord_latitude, lng: listing.coord_longitude },
			listing.listing_name,
			content,
		).then((marker) => {
			marker.addListener("gmp-click", () => onSelectRef.current?.(listing)); // ← use ref
			markerRef.current = marker;
		});

		return () => {
			if (markerRef.current) {
				removeMarker(markerRef.current);
				markerRef.current = null;
			}
			const root = rootRef.current;
			rootRef.current = null;
			queueMicrotask(() => root?.unmount());
		};
	}, [map, listing.listing_id]); 

	// Sync selected state
	useEffect(() => {
		if (!rootRef.current) return;
		renderPin(rootRef.current, isSelected ?? false);
	}, [isSelected, listing.category?.category_name]);
}
