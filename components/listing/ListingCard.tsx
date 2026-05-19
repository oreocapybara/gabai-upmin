import { ListingWithCategory } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import DirectionsIcon from "@mui/icons-material/Directions";
import CancelIcon from "@mui/icons-material/CancelRounded";
import { cn, formatCategoryName, formatPriceRange, getListingHoursStatus } from "@/lib/utils";
import { StaticStars } from "@/components/listing/StaticStars";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListingCard({
	listing,
	onDetails,
	onDirections,
	isDirectionsActive = false,
	averageRating,
	reviewCount,
	ratingsLoaded = false,
}: {
	listing: ListingWithCategory;
	onDetails: (listing: ListingWithCategory) => void;
	onDirections: (listing: ListingWithCategory) => void;
	isDirectionsActive?: boolean;
	averageRating?: number;
	reviewCount?: number;
	ratingsLoaded?: boolean;
}) {
	const hoursStatus = getListingHoursStatus(listing.opening_hours, listing.closing_hours);

	return (
		<div className="border-b border-stroke-tertiary">
			{/* Thumbnail + info */}
			<div className="flex gap-3 pt-3 pb-2">
				<div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-primary">
					<Image
						src={listing.image_url || "/logo.svg"}
						alt={listing.listing_name}
						fill
						sizes="96px, 80px"
						className={cn(
							listing.image_url ? "object-cover" : "object-contain p-2",
						)}
						draggable={false}
						onContextMenu={(e) => e.preventDefault()}
						onError={(e) => {
							(e.target as HTMLImageElement).src = "/logo.svg";
						}}
					/>
				</div>
				
				{/* Listing Information */}
				<div className="flex-1 min-w-0 flex flex-col justify-evenly">
					<h6 className="font-display font-semibold leading-snug line-clamp-2">
						{listing.listing_name}
					</h6>

					<div className="flex items-center gap-1.5">
						<span className="text-xs text-content-secondary">
							{formatCategoryName(listing.category.category_name)}
						</span>
						<span className="text-content-tertiary text-xs">·</span>
						<span
							className={cn(
								"text-xs font-medium",
								hoursStatus === "open"
									? "text-content-positive"
									: hoursStatus === "closed"
										? "text-content-negative"
										: "text-content-tertiary",
							)}
						>
							{hoursStatus === "open"
								? "Open"
								: hoursStatus === "closed"
									? "Closed"
									: "Hours vary"}
						</span>
					</div>


					{formatPriceRange(listing.price_min, listing.price_max) && (
						<span className="text-xs text-content-secondary leading-none">
							{formatPriceRange(listing.price_min, listing.price_max)}
						</span>
					)}

					{!ratingsLoaded ? (
						<div className="h-3 w-20 rounded-full bg-surface-secondary animate-pulse mt-0.5" />
					) : (reviewCount ?? 0) > 0 ? (
						<div className="flex items-center gap-1 mt-0.5">
							<span className="text-xs font-bold text-content-primary leading-none">
								{(averageRating ?? 0).toFixed(1)}
							</span>
							<StaticStars rating={averageRating ?? 0} iconClassName="!text-[12px]" />
							<span className="text-xs text-content-tertiary leading-none">
								({reviewCount})
							</span>
						</div>
					) : (
						<span className="text-xs text-content-tertiary mt-0.5">No reviews yet</span>
					)}
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2 pb-3">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => onDetails(listing)}
				>
					Details
				</Button>
				<Button
					variant="default"
					size="sm"
					className={cn(
						"flex-1",
						isDirectionsActive
							? "bg-content-positive-bold text-content-inverse-primary hover:bg-content-positive active:bg-content-positive"
							: "bg-surface-brand text-content-inverse-primary hover:bg-surface-brand-hover active:bg-surface-brand-pressed",
					)}
					leadingIcon={isDirectionsActive ? <CancelIcon /> : <DirectionsIcon />}
					onClick={() => onDirections(listing)}
				>
					{isDirectionsActive ? "Stop" : "Directions"}
				</Button>
			</div>
		</div>
	);
}
