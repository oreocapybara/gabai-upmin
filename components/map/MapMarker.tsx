"use client";

import type { ListingWithCategory } from "@/types";
import { useMapMarker } from "@/hooks/useMapMarker";

export interface MapMarkerProps {
	map: google.maps.Map;
	listing: ListingWithCategory;
	isSelected?: boolean;
	onSelect?: (listing: ListingWithCategory) => void;
}

export const MapMarker = (props: MapMarkerProps) => {
	useMapMarker(props);
	return null;
};
