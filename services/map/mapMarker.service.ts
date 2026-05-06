import { importLibrary } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

let markerLibPromise: Promise<google.maps.MarkerLibrary> | null = null;

function getMarkerLib() {
	if (!markerLibPromise) {
		markerLibPromise = importLibrary(
			"marker",
		) as Promise<google.maps.MarkerLibrary>;
	}
	return markerLibPromise;
}

export async function createAdvancedMarker(
	map: google.maps.Map,
	position: { lat: number; lng: number },
	title: string,
	content: HTMLElement,
	clusterer?: MarkerClusterer,
): Promise<google.maps.marker.AdvancedMarkerElement> {
	const { AdvancedMarkerElement } = await getMarkerLib();

	const marker = new AdvancedMarkerElement({
		map: clusterer ? null : map, // if clustering, don't add directly to map
		position,
		title,
		content,
	});

	if (clusterer) {
		clusterer.addMarker(marker);
	}

	return marker;
}
export function removeMarker(
	marker: google.maps.marker.AdvancedMarkerElement,
): void {
	marker.map = null;
}
