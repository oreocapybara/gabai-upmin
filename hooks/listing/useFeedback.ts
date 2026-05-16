import { useEffect, useState } from "react";

import { feedbackService, type Feedback } from "@/services/feedback.service";

export function useFeedbacks(listingId: number) {
	const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let mounted = true;

		const fetchFeedbacks = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const data = await feedbackService.getFeedbacksForListing(listingId);
				if (mounted) {
					setFeedbacks(data);
				}
			} catch (err) {
				if (mounted) {
					setError(
						err instanceof Error ? err : new Error("Failed to load feedbacks"),
					);
					setFeedbacks([]);
				}
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		};

		fetchFeedbacks();

		return () => {
			mounted = false;
		};
	}, [listingId]);

	return { feedbacks, isLoading, error };
}
