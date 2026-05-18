import { ListingWithCategory } from "@/types";
import { ListingCardSkeleton } from "./ListingSkeleton";
import ListingCard from "./ListingCard";
import type { RatingStat } from "@/hooks/listing/useAllRatings";

export default function ListingList({
	listings,
	isLoading,
	onDetails,
	onDirections,
	directionsListingId,
	allRatings = {},
	ratingsLoaded = false,
}: {
	listings: ListingWithCategory[];
	isLoading: boolean;
	onDetails: (listing: ListingWithCategory) => void;
	onDirections: (listing: ListingWithCategory) => void;
	directionsListingId: ListingWithCategory["listing_id"] | null;
	allRatings?: Record<number, RatingStat>;
	ratingsLoaded?: boolean;
}) {
	if (isLoading) {
		return (
			<div>
				{/* Render 4 skeleton cards to fill the drawer area */}
				{[...Array(4)].map((_, i) => (
					<ListingCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (!listings.length) {
		return (
			<div className="text-center py-10 text-s text-content-tertiary uppercase tracking-widest font-medium">
				No listings yet
			</div>
		);
	}

	// Bubble the active directions listing to the top; otherwise preserve caller's order.
	const orderedListings = directionsListingId
		? [
				...listings.filter((l) => l.listing_id === directionsListingId),
				...listings.filter((l) => l.listing_id !== directionsListingId),
			]
		: listings;

	return (
		<div className="space-y-2">
			{orderedListings.map((listing) => {
				const stat = allRatings[listing.listing_id];
				return (
					<div
						key={listing.listing_id}
						className="animate-[fadeInUp_240ms_ease-out]"
					>
						<ListingCard
							listing={listing}
							onDetails={onDetails}
							onDirections={onDirections}
							isDirectionsActive={directionsListingId === listing.listing_id}
							averageRating={stat?.avg}
							reviewCount={stat?.count}
							ratingsLoaded={ratingsLoaded}
						/>
					</div>
				);
			})}
		</div>
	);
}
