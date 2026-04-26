"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import React, { useEffect } from "react";

let mapsLoaderPromise: Promise<any> | null = null;
const loadGoogleMaps = () => {
	if (!mapsLoaderPromise) {
		//Set loader options
		setOptions({
			key: process.env.NEXT_PUBLIC_MAPS_API_KEY,
			v: "weekly",
		});

		//Load maps library
		mapsLoaderPromise = importLibrary("maps");
	}
	return mapsLoaderPromise;
};

export default function Map() {
	const mapRef = React.useRef<HTMLDivElement>(null);
	const mapInstanceRef = React.useRef<any>(null);

	useEffect(() => {
		let cancelled = false;

		const initMap = async (): Promise<void> => {
			try {
				const { Map } = await loadGoogleMaps();
				if (cancelled) return;
				if (!mapRef.current) return;

				const mapOptions: google.maps.MapOptions = {
					center: { lat: 7.08577271110286, lng: 125.4853479996858 },
					zoom: 16,
					mapId: process.env.NEXT_PUBLIC_MAP_ID,
				};

				const map = new Map(mapRef.current as HTMLDivElement, mapOptions);
				mapInstanceRef.current = map;
			} catch (err) {
				// Non-fatal: log and allow app to continue
				// eslint-disable-next-line no-console
				console.error("Failed to initialize Google Maps", err);
			}
		};

		initMap();

		// Cleanup function to prevent memory leaks
		return () => {
			cancelled = true;

			const map = mapInstanceRef.current;

			if (map) {
				try {
					if (window?.google?.maps?.event?.clearInstanceListeners) {
						google.maps.event.clearInstanceListeners(map);
					}
				} catch (e) {
					/* ignore cleanup errors */
				}

				// Some marker/overlay implementations (AdvancedMarkerElement) attach DOM nodes
				// inside the map container. Remove children to allow GC of those nodes.
				if (mapRef.current) {
					while (mapRef.current.firstChild) {
						mapRef.current.removeChild(mapRef.current.firstChild);
					}
				}

				// Drop our reference so GC can collect the map instance
				mapInstanceRef.current = null;
			}
		};
	}, []);
	return <div style={{ height: "600px" }} ref={mapRef} />;
}
