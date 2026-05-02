import Map from "@/components/map/Map";
import { listingService } from "@/services/listing.service";

export default async function Page() {
	const listings = await listingService.getAllListings(0); // call listings to render markers on map

	return (
		<main className="flex min-h-screen w-screen">
			<Map initialListings={listings} />
		</main>
	);
}
