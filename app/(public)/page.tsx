import { MapWithDrawer } from "@/components/MapWithDrawer";
import { listingService } from "@/services/listing.service";
import { categoryService } from "@/services/category.service";

export default async function Page() {
	const initialListings = await listingService.getAllListings(0);
	const categories = await categoryService.getAllCategories(0);

	return (
		<main className="min-h-svh w-full">
			<MapWithDrawer
				initialListings={initialListings}
				categories={categories}
			/>
		</main>
	);
}
