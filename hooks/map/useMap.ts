// This file contains the logic to render the map once its ready
import { initGoogleMap } from "@/services/map/map.service";
import { useEffect, useRef, useState } from "react";

export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
	// Track changes in map instance
	const mapInstanceRef = useRef<google.maps.Map | null>(null);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [mapError, setMapError] = useState<Error | null>(null); // ← moved outside effect

	useEffect(() => {
		if (!containerRef.current) return;
		let isMounted = true;

		initGoogleMap(containerRef.current)
			.then((instance) => {
				mapInstanceRef.current = instance;
				if (isMounted) setMap(instance);
			})
			.catch((err) => {
				console.error(err);
				if (isMounted) setMapError(err); // surface the error
			});

		return () => {
			// ← cleanup is now reachable
			isMounted = false;
			if (mapInstanceRef.current) {
				google.maps.event.clearInstanceListeners(mapInstanceRef.current);
				mapInstanceRef.current = null;
			}
			setMap(null);
		};
	}, [containerRef]);

	return { map, mapError }; // ← return both so Map.tsx can show an error UI
}
