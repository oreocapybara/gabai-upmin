import { ListingWithCategory } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import DirectionsIcon from "@mui/icons-material/Directions";
import CancelIcon from "@mui/icons-material/CancelRounded";
import { cn, formatCategoryName, isListingOpen } from "@/lib/utils";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListingCard({
	listing,
	onDetails,
	onDirections,
	isDirectionsActive = false,
}: {
	listing: ListingWithCategory;
	onDetails: (listing: ListingWithCategory) => void;
	onDirections: (listing: ListingWithCategory) => void;
	isDirectionsActive?: boolean;
}) {
	const open = isListingOpen(listing.opening_hours, listing.closing_hours);

	return (
		<div className="border-b border-stroke-tertiary bg-surface-secondary self-stretch overflow-clip">
			<div className="flex self-stretch items-center p-1">
				<Image
					src="/logo.svg"
					alt={listing.listing_name}
					width={112}
					height={108}
					className="object-contain rounded-xl bg-surface-primary p-2"
				/>

				<div className="flex flex-col flex-auto gap-3 justify-stretch">
					<div className="flex flex-col items-start gap-1">
						<h6 className="font-display font-semibold text-content-primary">
							{listing.listing_name}
						</h6>
						<div className="flex items-center gap-2 text-content-secondary text-s">
							<span>{formatCategoryName(listing.category.category_name)}</span>
							<span className="text-content-tertiary"></span>
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
