"use client";

import { importLibrary } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";
import type { ListingWithCategory } from "@/types";
import { getPinStyle } from "./MapPin";

interface MapMarkerProps {
	map: google.maps.Map;
	listing: ListingWithCategory;
}

export const MapMarker = ({ map, listing }: MapMarkerProps) => {
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);

	useEffect(() => {
		// If there is no map return
		if (!map) return;

		const initMarker = async () => {
			// Load Marker Library
			const { AdvancedMarkerElement, PinElement } = (await importLibrary(
				"marker",
			)) as google.maps.MarkerLibrary;

			// Access listings and retrieve category
			const name = listing.category?.category_name;
			const style = getPinStyle(name);

			const pin = new PinElement({
				background: style.background,
				glyphColor: style.glyphColor,
				borderColor: style.borderColor,
				glyphSrc: style.glyph,
			});

			// Create the actual Marker
			const marker = new AdvancedMarkerElement({ 
				map,
				position: {
					lat: listing.coord_latitude,
					lng: listing.coord_longitude,
				},
				title: listing.listing_name,
				content: pin as unknown as HTMLElement,
			});
		};

		initMarker();

		// Cleanup to prevent memory leaks
		return () => {
			if (markerRef.current) {
				markerRef.current.map = null;
				markerRef.current = null;
			}
		};
	}, [map, listing]);

	return null;
};
