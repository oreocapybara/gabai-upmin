// hooks/useGeolocation.ts
"use client";

import { useEffect, useState } from "react";

export interface GeoPosition {
	lat: number;
	lng: number;
}

export function useGeolocation(watch = true) {
	const [position, setPosition] = useState<GeoPosition | null>(null);
	const [error, setError] = useState<GeolocationPositionError | null>(null);

	useEffect(() => {
		if (!navigator.geolocation) {
			setError(new Error("Geolocation not supported") as any);
			return;
		}

		let watchId: number | null = null;

		const onSuccess = (pos: GeolocationPosition) => {
			setPosition({
				lat: pos.coords.latitude,
				lng: pos.coords.longitude,
			});
		};

		const onError = (err: GeolocationPositionError) => setError(err);

		if (watch) {
			watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
				enableHighAccuracy: true,
				maximumAge: 3000,
				timeout: 10000,
			});
		} else {
			navigator.geolocation.getCurrentPosition(onSuccess, onError);
		}

		return () => {
			if (watchId != null) navigator.geolocation.clearWatch(watchId);
		};
	}, [watch]);

	return { position, error };
}
