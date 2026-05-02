import { importLibrary } from "@googlemaps/js-api-loader";

export async function createAdvancedMarker(
	map: google.maps.Map,
	position: { lat: number; lng: number },
	title: string,
	content: HTMLElement,
): Promise<google.maps.marker.AdvancedMarkerElement> {
	const { AdvancedMarkerElement } = (await importLibrary(
		"marker",
	)) as google.maps.MarkerLibrary;

	return new AdvancedMarkerElement({ map, position, title, content });
}
export function removeMarker(
	marker: google.maps.marker.AdvancedMarkerElement,
): void {
	marker.map = null;
}
