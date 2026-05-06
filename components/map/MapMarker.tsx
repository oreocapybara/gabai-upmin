"use client";

import type { ListingWithCategory } from "@/types";
import { useMapMarker } from "@/hooks/map/useMapMarker";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

export interface MapMarkerProps {
	map: google.maps.Map;
	listing: ListingWithCategory;
	isSelected?: boolean;
	onSelect?: (listing: ListingWithCategory) => void;
	clusterer?: MarkerClusterer | null;
	isHidden?: boolean;
}

export const MapMarker = (props: MapMarkerProps) => {
	useMapMarker(props);
	return null;
};
