import { importLibrary } from "@googlemaps/js-api-loader";

const ROUTES_API_URL =
	"https://routes.googleapis.com/directions/v2:computeRoutes";

let polyline: google.maps.Polyline | null = null;

type TravelMode = "WALK" | "DRIVE" | "BICYCLE" | "TRANSIT";

interface ComputeRoutesRequest {
	origin: google.maps.LatLngLiteral;
	destination: google.maps.LatLngLiteral;
	travelMode?: TravelMode;
}

async function fetchRoute(
	origin: google.maps.LatLngLiteral,
	destination: google.maps.LatLngLiteral,
	travelMode: TravelMode,
): Promise<string> {
	const response = await fetch(ROUTES_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Goog-Api-Key": process.env.NEXT_PUBLIC_MAPS_API_KEY!,
			"X-Goog-FieldMask": "routes.polyline.encodedPolyline",
		},
		body: JSON.stringify({
			origin: {
				// Users current position
				location: {
					latLng: {
						latitude: origin.lat,
						longitude: origin.lng,
					},
				},
			}, // Selected listing location
			destination: {
				location: {
					latLng: {
						latitude: destination.lat,
						longitude: destination.lng,
					},
				},
			},
			//TODO: For future implementation
			// different travel modes for now defaul is DRIVE
			travelMode,
		}),
	});

	if (!response.ok) {
		throw new Error(
			`Routes API error: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	const encoded = data.routes?.[0]?.polyline?.encodedPolyline;

	if (!encoded) throw new Error("No route found in Routes API response");

	return encoded;
}

function drawPolyline(map: google.maps.Map, path: google.maps.LatLng[]): void {
	if (polyline) {
		polyline.setPath(path);
		polyline.setMap(map);
		return;
	}

	const baseColor = "#b91c4b"; // maroon - 600

	polyline = new google.maps.Polyline({
		path,
		map,
		strokeColor: baseColor,
		strokeOpacity: 0.9,
		strokeWeight: 7, // ← was 10
		geodesic: true, // ← missing, fixes rendering at all zoom levels
	});
}

export async function fetchAndRenderDirections(
	map: google.maps.Map,
	{ origin, destination, travelMode = "WALK" }: ComputeRoutesRequest,
): Promise<void> {
	const geometry = (await importLibrary(
		"geometry",
	)) as typeof google.maps.geometry;

	const encodedPolyline = await fetchRoute(origin, destination, travelMode);
	const path = geometry.encoding.decodePath(encodedPolyline);
	drawPolyline(map, path);

	const bounds = new google.maps.LatLngBounds();
	path.forEach((point) => bounds.extend(point));
	map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
}

export function clearDirections(): void {
	if (polyline) {
		polyline.setMap(null);
		polyline = null;
	}
}
