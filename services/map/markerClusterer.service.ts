import {
	MarkerClusterer,
	SuperClusterAlgorithm,
} from "@googlemaps/markerclusterer";

let clusterer: MarkerClusterer | null = null;

export function initClusterer(map: google.maps.Map): MarkerClusterer {
	clusterer = new MarkerClusterer({
		map,
		algorithm: new SuperClusterAlgorithm({
			radius: 80, // px — how close markers need to be to cluster
			maxZoom: 16, // stop clustering at this zoom level
		}),
	});
	return clusterer;
}

export function addMarkerToClusterer(
	marker: google.maps.marker.AdvancedMarkerElement,
): void {
	clusterer?.addMarker(marker);
}

export function removeMarkerFromClusterer(
	marker: google.maps.marker.AdvancedMarkerElement,
): void {
	clusterer?.removeMarker(marker);
}

export function clearClusterer(): void {
	clusterer?.clearMarkers();
	clusterer?.setMap(null);
	clusterer = null;
}
