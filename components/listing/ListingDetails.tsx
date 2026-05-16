"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import DirectionsIcon from "@mui/icons-material/Directions";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CancelIcon from "@mui/icons-material/CancelRounded";
import type { ListingWithCategory } from "@/types";
import { useFeedbacks } from "@/hooks/listing/useFeedback";
import {
	cn,
	formatCategoryName,
	formatPriceRange,
	isListingOpen,
	resolveStarBreakdown,
} from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingDetailsProps {
	listing: ListingWithCategory;
	onSeeReviews: () => void;
	onDirections: (listing: ListingWithCategory) => void;
	onRate: (rating: number) => void;
	isDirectionsActive?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StaticStars({
	rating,
	size = "small",
}: {
	rating: number;
	size?: "small" | "inherit";
}) {
	const { full, hasHalf, empty } = resolveStarBreakdown(rating);
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: full }).map((_, i) => (
				<StarIcon
					key={`full-${i}`}
					fontSize={size}
					className="text-content-notice"
				/>
			))}
			{hasHalf && (
				<StarHalfIcon fontSize={size} className="text-content-notice" />
			)}
			{Array.from({ length: empty }).map((_, i) => (
				<StarBorderIcon
					key={`empty-${i}`}
					fontSize={size}
					className="text-content-notice opacity-30"
				/>
			))}
		</div>
	);
}

function ReviewSkeleton() {
	return (
		<div className="rounded-xl p-4 bg-surface-secondary border border-stroke-tertiary animate-pulse space-y-2">
			<div className="flex justify-between">
				<div className="h-3 w-28 bg-gray-200 rounded-full" />
				<div className="h-3 w-16 bg-gray-200 rounded-full" />
			</div>
			<div className="h-3 w-20 bg-gray-200 rounded-full" />
			<div className="h-3 w-full bg-gray-200 rounded-full" />
			<div className="h-3 w-3/4 bg-gray-200 rounded-full" />
		</div>
	);
}

function MetaPill({ label }: { label: string }) {
	return (
		<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-secondary border border-stroke-tertiary text-content-secondary text-s font-normal">
			{label}
		</span>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingDetails({
	listing,
	onDirections,
	onRate,
	isDirectionsActive = false,
}: ListingDetailsProps) {
	const { feedbacks, isLoading } = useFeedbacks(listing.listing_id);

	const averageRating = feedbacks.length
		? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
		: 0;

	const ratingLabel = isLoading ? "–" : averageRating.toFixed(1);
	const open = isListingOpen(listing.opening_hours, listing.closing_hours);

	return (
		<div className="flex flex-col">
			{/* ── Hero Image ─────────────────────────────────────────────────────── */}
			<div className="relative aspect-square w-full bg-surface-secondary overflow-hidden rounded-xl mb-4">
				<Image
					src={listing.image_url || "/logo.svg"}
					alt={listing.listing_name}
					fill
					priority
					sizes="(max-width: 640px) 100vw, 640px"
					className="object-cover"
				/>
				{/* Open / Closed badge over the image */}
				<span
					className={cn(
						"absolute top-3 right-3 px-2.5 py-1 rounded-full text-s font-semibold shadow-sm",
						open
							? "bg-content-positive-bold text-content-inverse-primary"
							: "bg-content-negative-bold text-content-inverse-primary",
					)}
				>
					{open ? "Open now" : "Closed"}
				</span>
			</div>

			{/* ── Title + Rating ─────────────────────────────────────────────────── */}
			<div className="mb-3 px-0.5">
				<h6 className="font-display font-bold text-content-primary leading-tight mb-1">
					{listing.listing_name}
				</h6>

				{/* Aggregate rating row */}
				<div className="flex items-center gap-2 mb-3">
					<span className="text-content-primary font-bold text-m leading-none">
						{ratingLabel}
					</span>
					<StaticStars rating={averageRating} />
					{!isLoading && feedbacks.length > 0 && (
						<span className="text-content-tertiary text-s">
							({feedbacks.length}{" "}
							{feedbacks.length === 1 ? "review" : "reviews"})
						</span>
					)}
				</div>

				{/* Meta pills row */}
				<div className="flex flex-wrap gap-1.5">
					<MetaPill
						label={formatCategoryName(listing.category.category_name)}
					/>
					{(listing.price_min != null || listing.price_max != null) && (
						<MetaPill label={formatPriceRange(listing.price_min, listing.price_max)} />
					)}
				</div>
			</div>

			{/* ── Action Button ──────────────────────────────────────────────────── */}
			<Button
				variant="default"
				size="sm"
				className={cn(
					"w-full mb-4",
					isDirectionsActive
						? "bg-content-positive-bold text-content-inverse-primary hover:bg-content-positive active:bg-content-positive"
						: "bg-surface-brand text-content-inverse-primary hover:bg-surface-brand-hover active:bg-surface-brand-pressed",
				)}
				leadingIcon={isDirectionsActive ? <CancelIcon /> : <DirectionsIcon />}
				onClick={() => onDirections(listing)}
			>
				{isDirectionsActive ? "Stop Directions" : "Get Directions"}
			</Button>

			{/* ── Description ────────────────────────────────────────────────────── */}
			{listing.description && (
				<div className="mb-4 pb-4 border-b border-stroke-tertiary">
					<p className="text-content-secondary text-sm leading-relaxed">
						{listing.description}
					</p>
				</div>
			)}

			{/* ── Rate Widget ────────────────────────────────────────────────────── */}
			<div className="mb-4 pb-4 border-b border-stroke-tertiary">
				<h6 className="font-display font-semibold text-content-primary mb-3">
					Rate your experience
				</h6>
				<div className="flex flex-col items-center gap-2 bg-surface-secondary rounded-xl py-5 border border-stroke-secondary">
					<StarRating onRate={onRate} />
				</div>
			</div>

			{/* ── Reviews ────────────────────────────────────────────────────────── */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h6 className="font-display font-semibold text-content-primary">
						Recent reviews
					</h6>
					{!isLoading && feedbacks.length > 0 && (
						<span className="text-s text-content-tertiary">
							{feedbacks.length} total
						</span>
					)}
				</div>

				<div className="space-y-2">
					{isLoading ? (
						<>
							<ReviewSkeleton />
							<ReviewSkeleton />
							<ReviewSkeleton />
						</>
					) : feedbacks.length > 0 ? (
						feedbacks.slice(0, 3).map((feedback, index) => (
							<div
								key={index}
								className="rounded-xl p-3.5 bg-surface-secondary border border-stroke-tertiary"
							>
								{/* Review header */}
								<div className="flex items-start justify-between gap-2 mb-1.5">
									<div className="flex flex-col gap-0.5">
										<span className="font-semibold text-content-primary text-sm leading-none">
											{feedback.nickname || "Anonymous"}
										</span>
										<div className="flex items-center gap-1">
											<StaticStars rating={feedback.rating} />
											<span className="text-content-tertiary text-s">
												{feedback.rating.toFixed(1)}
											</span>
										</div>
									</div>
									<span className="text-content-tertiary text-s shrink-0 mt-0.5">
										{new Date(feedback.feedback_date).toLocaleDateString(
											undefined,
											{
												month: "short",
												day: "numeric",
												year: "numeric",
											},
										)}
									</span>
								</div>

								{/* Review body */}
								{feedback.feedback_message && (
									<p className="text-content-secondary text-sm leading-relaxed">
										{feedback.feedback_message}
									</p>
								)}
							</div>
						))
					) : (
						<div className="flex flex-col items-center py-8 text-center">
							<StarBorderIcon
								className="text-content-tertiary opacity-40 mb-2"
								sx={{ fontSize: 32 }}
							/>
							<p className="text-content-tertiary text-sm">No reviews yet.</p>
							<p className="text-content-tertiary text-s mt-0.5">
								Be the first to rate this place!
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
