"use client";
import { useUserMarker } from "@/hooks/map/useUserMarker";

interface UserMarkerProps {
	map: google.maps.Map | null;
	position: {
		lat: number;
		lng: number;
		heading: number | null;
		accuracy: number | null;
	} | null;
}

export function UserMarker({ map, position }: UserMarkerProps) {
	useUserMarker({ map, position });

	return null;
}
