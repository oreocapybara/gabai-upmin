import { initGoogleMap } from "@/services/map.service";
import { useEffect, useRef, useState } from "react";

export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
	const mapInstanceRef = useRef<google.maps.Map | null>(null);
	const [map, setMap] = useState<google.maps.Map | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		let isMounted = true;

		initGoogleMap(containerRef.current).then((instance) => {
			mapInstanceRef.current = instance;
			if (isMounted) setMap(instance);
		});

		return () => {
			isMounted = false;
			if (mapInstanceRef.current) {
				google.maps.event.clearInstanceListeners(mapInstanceRef.current);
				mapInstanceRef.current = null;
			}
			setMap(null);
		};
	}, []);

	return map;
}
