"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import React, { useEffect } from "react";

export default function Map() {
	const mapRef = React.useRef<HTMLDivElement>(null);
	const mapInstanceRef = React.useRef<any>(null);

	useEffect(() => {
		const initMap = async (): Promise<void> => {
			// Set Loader Options
			setOptions({
				key: process.env.NEXT_PUBLIC_MAPS_API_KEY,
				v: "weekly",
			});

			//Load Maps Library
			const { Map } = await importLibrary("maps");

			//set Map options
			const mapOptions = {
				center: {
					lat: 7.08577271110286,
					lng: 125.4853479996858,
				},
				zoom: 16,
				// styles: [
				//     {
				//         featureType: "poi",
				//         elementType: "labels",
				//         stylers: [{ visibility: "off" }],
				//     },
				//     {
				//         featureType: "transit",
				//         elementType: "labels",
				//         stylers: [{ visibility: "off" }],
				//     },
				// ],

				mapId: process.env.NEXT_PUBLIC_MAP_ID,

				// disableDefaultUI: true,
			};

			//Declare the map
			const map = new Map(mapRef.current as HTMLDivElement, mapOptions);
			mapInstanceRef.current = map;
		};

		initMap();

		// Cleanup function to prevent memory leaks
		return () => {
			if (mapInstanceRef.current) {
				// Clear all listeners and references
				google.maps.event.clearInstanceListeners(mapInstanceRef.current);
				mapInstanceRef.current = null;
			}
		};
	}, []);
	return <div style={{ height: "600px" }} ref={mapRef} />;
}
