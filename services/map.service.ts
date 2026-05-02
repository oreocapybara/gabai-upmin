import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

export async function initGoogleMap(
	container: HTMLDivElement,
): Promise<google.maps.Map> {
	//  set Loader Options
	setOptions({
		key: process.env.NEXT_PUBLIC_MAPS_API_KEY,
		v: "weekly",
	});

	const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;

	return new Map(container, {
		center: { lat: 7.08577271110286, lng: 125.4853479996858 },
		zoom: 18,
		tilt: 45, 
		mapId: process.env.NEXT_PUBLIC_MAP_ID,
	});
}
