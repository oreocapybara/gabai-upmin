// This file contains logic to handle everything related to feedbacks
import { createClient } from "@/lib/supabase/client";

export interface Feedback {
	feedback_id: number;
	listing_id: number;
	nickname: string | null;
	rating: number;
	feedback_message: string | null;
	feedback_date: string;
}

export const feedbackService = {
	async getAllAverageRatings(): Promise<Record<number, { avg: number; count: number }>> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("Feedback")
			.select("listing_id, rating");

		if (error) throw error;

		const totals: Record<number, { sum: number; count: number }> = {};
		for (const row of data ?? []) {
			if (!totals[row.listing_id]) totals[row.listing_id] = { sum: 0, count: 0 };
			totals[row.listing_id].sum += row.rating;
			totals[row.listing_id].count += 1;
		}

		return Object.fromEntries(
			Object.entries(totals).map(([id, { sum, count }]) => [
				Number(id),
				{ avg: sum / count, count },
			]),
		);
	},

	async getFeedbacksForListing(listingId: number): Promise<Feedback[]> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("Feedback")
			.select("feedback_id, listing_id, nickname, rating, feedback_message, feedback_date")
			.eq("listing_id", listingId)
			.order("feedback_date", { ascending: false });

		if (error) throw error;

		return (data ?? []) as Feedback[];
	},

	async insertFeedback(
		feedback: Omit<Feedback, "feedback_date" | "feedback_id">,
	): Promise<Feedback> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("Feedback")
			.insert({
				listing_id: feedback.listing_id,
				nickname: feedback.nickname || null,
				rating: feedback.rating,
				feedback_message: feedback.feedback_message || null,
				feedback_date: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) throw error;

		return data as Feedback;
	},
};
