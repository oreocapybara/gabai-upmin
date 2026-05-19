"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StarRating } from "@/components/ui/StarRating";

import CheckIcon from "@mui/icons-material/CheckRounded";
import PersonIcon from "@mui/icons-material/PersonRounded";
import type { ListingWithCategory } from "@/types";
import ListingCard from "@/components/listing/ListingCard";
import { feedbackService } from "@/services/feedback.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewSectionProps {
	listing: ListingWithCategory;
	initialRating: number;
	onDetails: (listing: ListingWithCategory) => void;
	/** Optional: only needed when the listing card's Directions button is reachable from this view. */
	onDirections?: (listing: ListingWithCategory) => void;
	onSubmitSuccess?: () => void;
	onSubmitError?: (message: string) => void;
	isDirectionsActive?: boolean;
	averageRating?: number;
	reviewCount?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewSection({
	listing,
	initialRating = 0,
	onDetails,
	onDirections,
	onSubmitSuccess,
	onSubmitError,
	isDirectionsActive = false,
	averageRating,
	reviewCount,
}: ReviewSectionProps) {
	const [userRating, setUserRating] = useState(initialRating);
	const [nickname, setNickname] = useState("");
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setUserRating(initialRating);
	}, [initialRating]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!userRating || !message.trim()) {
			onSubmitError?.("Please fill in rating and review message.");
			return;
		}

		try {
			setIsSubmitting(true);
			await feedbackService.insertFeedback({
				listing_id: listing.listing_id,
				nickname: nickname.trim() || null,
				rating: userRating,
				feedback_message: message.trim(),
			});

			setNickname("");
			setMessage("");
			setUserRating(0);
			onSubmitSuccess?.();
		} catch (error) {
			console.error("Failed to submit feedback:", error);
			onSubmitError?.("Failed to submit feedback. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="text-content-brand font-display font-bold">
					You are reviewing:
				</p>
				<ListingCard
					listing={listing}
					onDetails={onDetails}
					onDirections={onDirections ?? (() => {})}
					isDirectionsActive={isDirectionsActive}
					averageRating={averageRating}
					reviewCount={reviewCount}
					ratingsLoaded={true}
				/>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-8">
				<div>
					<h6 className="font-display text-content-primary font-semibold">Rate your experience</h6>
					<div className="flex flex-col items-center gap-2 bg-surface-secondary rounded-xl py-6 border border-stroke-secondary">
						<StarRating
							initialValue={userRating}
							onRate={(val) => setUserRating(val)}
						/>
					</div>
				</div>

				<Input
					label="Name"
					className="h-8"
					leading={<PersonIcon />}
					placeholder="Anonymous"
					value={nickname}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setNickname(e.target.value)
					}
				/>

				<Input
					label="Review*"
					multiline
					className="h-24"
					placeholder="The place was..."
					value={message}
					required
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setMessage(e.target.value)
					}
				/>

				<Button
					variant="default"
					type="submit"
					trailingIcon={<CheckIcon />}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<span className="inline-flex items-center gap-2">
							<span
								className="h-4 w-4 animate-spin rounded-full border-2 border-surface-primary border-t-transparent"
								aria-hidden="true"
							/>
							Submitting...
						</span>
					) : (
						"Submit Review"
					)}
				</Button>
			</form>
		</div>
	);
}
