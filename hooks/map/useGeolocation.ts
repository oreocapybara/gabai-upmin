import { useEffect, useState } from "react";
import {
	watchUserPosition,
	clearWatch,
} from "@/services/map/geolocation.service";
import type { GeolocationResult } from "@/services/map/geolocation.service"; // ← removed double slash

export type GeolocationState = {
	position: GeolocationResult | null;
	error: GeolocationPositionError | null;
	isSupported: boolean;
};

export function useGeolocation(): GeolocationState {
	const [isSupported, setIsSupported] = useState(false);
	const [position, setPosition] = useState<GeolocationResult | null>(null);
	const [error, setError] = useState<GeolocationPositionError | null>(null);

	useEffect(() => {
		const supported = "geolocation" in navigator;
		setIsSupported(supported);
		if (!supported) return;

		const watchId = watchUserPosition(setPosition, setError);
		return () => clearWatch(watchId);
	}, []);

	return { position, error, isSupported };
}
