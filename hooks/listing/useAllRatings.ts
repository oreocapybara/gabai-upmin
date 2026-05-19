import { useCallback, useEffect, useState } from "react";
import { feedbackService } from "@/services/feedback.service";

export type RatingStat = { avg: number; count: number };

export function useAllRatings(): {
	ratings: Record<number, RatingStat>;
	isLoaded: boolean;
	refresh: () => void;
} {
	const [ratings, setRatings] = useState<Record<number, RatingStat>>({});
	const [isLoaded, setIsLoaded] = useState(false);
	const [refreshToken, setRefreshToken] = useState(0);

	useEffect(() => {
		let mounted = true;

		feedbackService
			.getAllAverageRatings()
			.then((data) => {
				if (mounted) {
					setRatings(data);
					setIsLoaded(true);
				}
			})
			.catch(() => {
				if (mounted) setIsLoaded(true);
			});

		return () => {
			mounted = false;
		};
	}, [refreshToken]);

	const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

	return { ratings, isLoaded, refresh };
}
