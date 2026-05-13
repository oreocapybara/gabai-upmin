import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
	createAdvancedMarker,
	removeMarker,
} from "@/services/map/mapMarker.service";

export type UserMarkerParams = {
	map: google.maps.Map | null;
	position: {
		lat: number;
		lng: number;
		heading: number | null;
		accuracy: number | null;
	} | null;
};

export function useUserMarker({ map, position }: UserMarkerParams) {
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);
	const arrowRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!map || !position || markerRef.current) return;

		let isCancelled = false;

		const wrapper = document.createElement("div");
		wrapper.className = cn("relative flex items-center justify-center");

		const userDot = document.createElement("div");
		userDot.className = cn(
			"bg-surface-info border-4 border-stroke-inverse rounded-full p-2 shadow drop-shadow",
		);

		const arrow = document.createElement("div");
		arrow.className = cn(
			"absolute left-1/2 -top-2 h-0 w-0 -translate-x-1/2",
			"border-l-[6px] border-r-[6px] border-b-[10px]",
			"border-l-transparent border-r-transparent border-b-surface-info",
		);
		arrow.style.transformOrigin = "50% 100%";
		arrowRef.current = arrow;

		wrapper.appendChild(arrow);
		wrapper.appendChild(userDot);

		createAdvancedMarker(map, position, "Your Location", wrapper).then(
			(marker) => {
				if (isCancelled) {
					removeMarker(marker);
					return;
				}
				markerRef.current = marker;
			},
		);

		return () => {
			isCancelled = true;

			if (markerRef.current) {
				removeMarker(markerRef.current);
				markerRef.current = null;
			}
		};
	}, [map, position]);

	useEffect(() => {
		if (!markerRef.current) return;

		if (!position) {
			removeMarker(markerRef.current);
			markerRef.current = null;
			return;
		}

		markerRef.current.position = { lat: position.lat, lng: position.lng };
		if (arrowRef.current) {
			if (position.heading == null) {
				arrowRef.current.style.opacity = "0";
			} else {
				arrowRef.current.style.opacity = "1";
				arrowRef.current.style.transform = `translateX(-50%) rotate(${position.heading}deg)`;
			}
		}
	}, [position]);
}
