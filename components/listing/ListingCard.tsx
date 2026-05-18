import { ListingWithCategory } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import DirectionsIcon from "@mui/icons-material/Directions";
import CancelIcon from "@mui/icons-material/CancelRounded";
import { cn, formatCategoryName, formatPriceRange, isListingOpen } from "@/lib/utils";
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
	const open = isListingOpen(listing.opening_hours, listing.closing_hours);

	return (
		<div className="border-b border-stroke-tertiary bg-surface-secondary self-stretch overflow-clip">
			<div className="flex self-stretch items-center gap-2 p-2">
				<div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-surface-primary">
					<Image
						src={listing.image_url || "/logo.svg"}
						alt={listing.listing_name}
						fill
						sizes="112px"
						className={cn(
							listing.image_url ? "object-cover" : "object-contain p-2",
						)}
						onError={(e) => {
							(e.target as HTMLImageElement).src = "/logo.svg";
						}}
					/>
				</div>

				<div className="flex flex-col flex-auto gap-3 justify-stretch">
					<div className="flex flex-col items-start gap-1">
						<h6 className="font-display font-semibold text-content-primary">
							{listing.listing_name}
						</h6>
						<div className="flex items-center gap-2 text-content-secondary text-s">
							<span>{formatCategoryName(listing.category.category_name)}</span>
							<span className="text-content-tertiary">·</span>
							<span
								className={cn(
									"px-2 py-0.5 rounded-full text-xs font-semibold",
									open
										? "bg-surface-positive text-content-inverse-primary"
										: "bg-content-negative text-content-inverse-primary",
								)}
							>
								{open ? "Open" : "Closed"}
							</span>
						</div>

						{/* Rating + price row */}
						{!ratingsLoaded ? (
							<div className="h-3 w-20 rounded-full bg-gray-200 animate-pulse mt-0.5" />
						) : (reviewCount ?? 0) > 0 ? (
							<div className="flex items-center gap-1 mt-0.5">
								<span className="text-xs font-bold text-content-primary leading-none">
									{(averageRating ?? 0).toFixed(1)}
								</span>
								<StaticStars rating={averageRating ?? 0} iconClassName="!text-[14px]" />
								<span className="text-content-tertiary text-xs leading-none">
									({reviewCount})
								</span>
								{formatPriceRange(listing.price_min, listing.price_max) && (
									<>
										<span className="text-content-tertiary text-xs leading-none">·</span>
										<span className="text-xs font-medium text-content-secondary leading-none">
											{formatPriceRange(listing.price_min, listing.price_max)}
										</span>
									</>
								)}
							</div>
						) : (
							<div className="flex items-center gap-1 mt-0.5">
								<span className="text-xs text-content-tertiary">No reviews yet</span>
								{formatPriceRange(listing.price_min, listing.price_max) && (
									<>
										<span className="text-content-tertiary text-xs">·</span>
										<span className="text-xs font-medium text-content-secondary">
											{formatPriceRange(listing.price_min, listing.price_max)}
										</span>
									</>
								)}
							</div>
						)}
					</div>

					<div className="flex self-stretch gap-2 text-s">
						<Button
							variant="secondary"
							size="sm"
							className="flex-1"
							onClick={() => onDetails(listing)}
						>
							Details
						</Button>
						<Button
							variant="default"
							size="sm"
							className={cn(
								"flex-[1.6]",
								isDirectionsActive
									? "bg-content-positive-bold text-content-inverse-primary hover:bg-content-positive active:bg-content-positive"
									: "bg-surface-brand text-content-inverse-primary hover:bg-surface-brand-hover active:bg-surface-brand-pressed",
							)}
							leadingIcon={
								isDirectionsActive ? <CancelIcon /> : <DirectionsIcon />
							}
							onClick={() => onDirections(listing)}
						>
							{isDirectionsActive ? "Stop" : "Directions"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
