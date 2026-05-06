import { useEffect, useMemo, useRef } from "react";
import {
	fetchAndRenderDirections,
	clearDirections,
} from "@/services/map/directions.service";
import type { GeolocationResult } from "@/services/map/geolocation.service";

interface UseDirectionsProps {
	map: google.maps.Map | null;
	userPosition: GeolocationResult | null;
	destination: google.maps.LatLngLiteral | null;
}

export function useDirections({
	map,
	userPosition,
	destination,
}: UseDirectionsProps) {
	// Step 1: flatten to primitives — primitives are safe in dep arrays, objects are not
	const originLat = userPosition ? roundCoord(userPosition.lat) : null;
	const originLng = userPosition ? roundCoord(userPosition.lng) : null;
	const destLat = destination?.lat ?? null;
	const destLng = destination?.lng ?? null;

	// Step 2: build a string that represents the current route
	// only changes when coords actually change — safe to use as effect dep
	const routeKey = useMemo(() => {
		if (
			originLat === null ||
			originLng === null ||
			destLat === null ||
			destLng === null
		) {
			return null;
		}
		return `${originLat},${originLng}-${destLat},${destLng}`;
	}, [originLat, originLng, destLat, destLng]);

	// Step 3: store the actual coord objects in a ref
	// the effect reads from this ref so it doesn't need the objects as deps
	const routeRef = useRef<{
		origin: google.maps.LatLngLiteral;
		destination: google.maps.LatLngLiteral;
	} | null>(null);

	// keep ref in sync every render
	routeRef.current =
		originLat !== null &&
		originLng !== null &&
		destLat !== null &&
		destLng !== null
			? {
					origin: { lat: originLat, lng: originLng },
					destination: { lat: destLat, lng: destLng },
				}
			: null;

	// Step 4: effect only depends on the string key — React can compare strings correctly
	useEffect(() => {
		if (!map || !routeKey || !routeRef.current) {
			clearDirections();
			return;
		}

		const controller = new AbortController();

		const timeout = setTimeout(() => {
			fetchAndRenderDirections(map, {
				origin: routeRef.current!.origin,
				destination: routeRef.current!.destination,
				travelMode: "DRIVE",
			}).catch((err) => {
				if (err.name !== "AbortError") console.error(err);
			});
		}, 250);

		return () => {
			clearTimeout(timeout);
			controller.abort();
			clearDirections();
		};
	}, [map, routeKey]); // only primitives here, no missing dep warnings
}

function roundCoord(coord: number): number {
	return Math.round(coord * 10000) / 10000;
}
