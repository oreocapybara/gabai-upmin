import { useEffect, useState } from "react";
import { feedbackService } from "@/services/feedback.service";

export function useAllRatings(): Record<number, number> {
	const [ratings, setRatings] = useState<Record<number, number>>({});

	useEffect(() => {
		feedbackService
			.getAllAverageRatings()
			.then(setRatings)
			.catch(() => setRatings({}));
	}, []);

	return ratings;
}
