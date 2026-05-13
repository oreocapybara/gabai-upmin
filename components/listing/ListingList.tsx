import { ListingWithCategory } from "@/types";
import { ListingCardSkeleton } from "./ListingSkeleton";
import ListingCard from "./ListingCard";

export default function ListingList({
	listings,
	isLoading,
	onDetails,
	onDirections,
	directionsListingId,
}: {
	listings: ListingWithCategory[];
	isLoading: boolean;
	onDetails: (listing: ListingWithCategory) => void;
	onDirections: (listing: ListingWithCategory) => void;
	directionsListingId: ListingWithCategory["listing_id"] | null;
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

	const orderedListings = directionsListingId
		? [
				...listings.filter((l) => l.listing_id === directionsListingId),
				...listings.filter((l) => l.listing_id !== directionsListingId),
			]
		: listings;

	return (
		<div className="space-y-2">
			{orderedListings.map((listing, index) => {
				const isDirectionsActive = directionsListingId === listing.listing_id;

				const card = (
					<div
						className="animate-[fadeInUp_240ms_ease-out]"
						key={listing.listing_id}
					>
						<ListingCard
							listing={listing}
							onDetails={onDetails}
							onDirections={onDirections}
							isDirectionsActive={isDirectionsActive}
						/>
					</div>
				);

				if (index === 0 && isDirectionsActive) {
					return <div key={`featured-${listing.listing_id}`}>{card}</div>;
				}

				return card;
			})}
		</div>
	);
}
