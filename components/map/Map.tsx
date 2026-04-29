"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";
import { listingService } from "@/services/listing.service";
import type { ListingWithCategory } from "@/types";
import { MapMarker } from "./MapMarker";

export default function Map() {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<google.maps.Map | null>(null);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [listings, setListings] = useState<ListingWithCategory[]>([]);

	useEffect(() => {
		let isMounted = true;

		const initMap = async (): Promise<void> => {
			// Set Loader Options
			setOptions({
				key: process.env.NEXT_PUBLIC_MAPS_API_KEY,
				v: "weekly",
			});

			//Load Maps Library
			const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;

			//set Map options
			const mapOptions = {
				center: {
					// UP Mindanao Oblation Coord
					lat: 7.08577271110286,
					lng: 125.4853479996858,
				},
				zoom: 16,
				mapId: process.env.NEXT_PUBLIC_MAP_ID,
			};

			//Declare the map
			const mapInstance = new Map(mapRef.current as HTMLDivElement, mapOptions);
			mapInstanceRef.current = mapInstance;
			if (isMounted) setMap(mapInstance);

			// Fetch Listings from Database
			const data = await listingService.getAllListings(0);
			if (isMounted) setListings(data);
		};

		initMap();

		// Cleanup function to prevent memory leaks
		return () => {
			isMounted = false;
			if (mapInstanceRef.current) {
				// Clear all listeners and references
				google.maps.event.clearInstanceListeners(mapInstanceRef.current);
				mapInstanceRef.current = null;
			}
			setMap(null);
		};
	}, []);

	return (
		<>
			<div className="w-screen" ref={mapRef} />
			{map &&
				listings.map((item) => (
					<MapMarker key={item.listing_id} map={map} listing={item} />
				))}
		</>
	);
}
