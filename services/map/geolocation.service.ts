export type GeolocationResult = {
	lat: number;
	lng: number;
	heading: number | null;
	accuracy: number | null;
};

export function watchUserPosition(
	onUpdate: (position: GeolocationResult) => void,
	onError: (error: GeolocationPositionError) => void,
): number {
	return navigator.geolocation.watchPosition(
		({ coords }) =>
			onUpdate({
				lat: coords.latitude,
				lng: coords.longitude,
				heading: coords.heading ?? null,
				accuracy: coords.accuracy ?? null,
			}),
		onError,
		{
			enableHighAccuracy: true,
			maximumAge: 10000, //10 seconds
			timeout: 5000, // 5 seconds
		},
	);
}

export function clearWatch(watchId: number): void {
	navigator.geolocation.clearWatch(watchId);
}
