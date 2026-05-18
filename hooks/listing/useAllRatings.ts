import { useEffect, useState } from "react";
import { feedbackService } from "@/services/feedback.service";

export type RatingStat = { avg: number; count: number };

export function useAllRatings(): { ratings: Record<number, RatingStat>; isLoaded: boolean } {
	const [ratings, setRatings] = useState<Record<number, RatingStat>>({});
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		feedbackService
			.getAllAverageRatings()
			.then((data) => {
				setRatings(data);
				setIsLoaded(true);
			})
			.catch(() => {
				setRatings({});
				setIsLoaded(true);
			});
	}, []);

	return { ratings, isLoaded };
}
