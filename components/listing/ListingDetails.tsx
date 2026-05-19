"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import DirectionsIcon from "@mui/icons-material/Directions";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CancelIcon from "@mui/icons-material/CancelRounded";
import type { ListingWithCategory } from "@/types";
import { useFeedbacks } from "@/hooks/listing/useFeedback";
import { StaticStars } from "@/components/listing/StaticStars";
import {
	cn,
	formatCategoryName,
	formatPriceRange,
	formatRelativeTime,
	getListingHoursStatus,
} from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingDetailsProps {
	listing: ListingWithCategory;
	onSeeReviews: () => void;
	onDirections: (listing: ListingWithCategory) => void;
	onRate: (rating: number) => void;
	isDirectionsActive?: boolean;
	feedbackVersion?: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
	onSeeReviews,
	onDirections,
	onRate,
	isDirectionsActive = false,
	feedbackVersion = 0,
}: ListingDetailsProps) {
	const { feedbacks, isLoading } = useFeedbacks(listing.listing_id, feedbackVersion);

	const averageRating = feedbacks.length
		? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
		: 0;

	const ratingLabel = isLoading ? "–" : averageRating.toFixed(1);
	const hoursStatus = getListingHoursStatus(listing.opening_hours, listing.closing_hours);

	return (
		<div className="flex flex-col mt-4">
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
				{/* Open / Closed / No-hours badge over the image */}
				<span
					className={cn(
						"absolute top-3 right-3 px-2.5 py-1 rounded-full text-s font-semibold shadow-sm leading-snug",
						hoursStatus === "open"
							? "bg-content-positive text-content-inverse-primary"
							: hoursStatus === "closed"
								? "bg-content-negative text-content-inverse-primary"
								: "bg-black/50 text-white backdrop-blur-sm",
					)}
				>
					{hoursStatus === "open"
						? "Open now"
						: hoursStatus === "closed"
							? "Closed"
							: "No hours"}
				</span>
			</div>

			{/* ── Title + Rating ─────────────────────────────────────────────────── */}
			<div className="mb-3 px-0.5">
				<h6 className="font-display font-bold text-content-primary leading-tight mb-1">
					{listing.listing_name}
				</h6>

				{/* Aggregate rating row */}
				<div className="flex items-center gap-2 mb-3">
					{isLoading ? (
						<div className="h-4 w-32 rounded-full bg-gray-200 animate-pulse" />
					) : feedbacks.length > 0 ? (
						<>
							<span className="text-content-primary font-bold text-m leading-none">
								{ratingLabel}
							</span>
							<StaticStars rating={averageRating} />
							<span className="text-content-tertiary text-s">
								({feedbacks.length}{" "}
								{feedbacks.length === 1 ? "review" : "reviews"})
							</span>
						</>
					) : (
						<span className="text-content-tertiary text-s">No reviews yet</span>
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
				<h6 className="font-display font-semibold text-content-primary">
					Rate your experience
				</h6>
				<p className="text-content-tertiary text-s mb-3">Tap a star to help out the next visitor.</p>
				<div className="flex flex-col items-center gap-2 bg-surface-secondary rounded-xl py-5 border border-stroke-secondary">
					<StarRating onRate={onRate} />
				</div>
			</div>

			{/* ── Reviews ────────────────────────────────────────────────────────── */}
			<div className="pb-2">
				<div className="flex items-center justify-between mb-3">
					<h6 className="font-display font-semibold text-content-primary">
						Recent reviews
					</h6>
					{!isLoading && feedbacks.length > 0 && (
						<button
							onClick={onSeeReviews}
							className="text-s text-content-brand font-medium hover:underline"
						>
							Write a review
						</button>
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
										{formatRelativeTime(feedback.feedback_date)}
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
							<button
								onClick={onSeeReviews}
								className="mt-3 text-s text-content-brand font-medium hover:underline"
							>
								Write a review
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
