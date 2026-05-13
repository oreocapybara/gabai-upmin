import { useEffect, useState } from "react";
import {
	initClusterer,
	clearClusterer,
} from "@/services/map/markerClusterer.service";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

export function useClusterer(
	map: google.maps.Map | null,
	enabled: boolean,
): MarkerClusterer | null {
	const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);

	useEffect(() => {
		if (!map || !enabled) {
			setClusterer(null);
			clearClusterer();
			return;
		}

		const instance = initClusterer(map);
		setClusterer(instance); // ← triggers re-render so Map.tsx gets the real instance

		return () => {
			setClusterer(null);
			clearClusterer();
		};
	}, [map, enabled]);

	return clusterer;
}
