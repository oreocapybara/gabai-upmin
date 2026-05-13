// This file contains logic to handle everything related to feedbacks
import { createClient } from "@/lib/supabase/client";

export interface Feedback {
	listing_id: number;
	nickname: string | null;
	rating: number;
	feedback_message: string | null;
	feedback_date: string;
}

export const feedbackService = {
	async getFeedbacksForListing(listingId: number): Promise<Feedback[]> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("Feedback")
			.select("listing_id, nickname, rating, feedback_message, feedback_date")
			.eq("listing_id", listingId)
			.order("feedback_date", { ascending: false });

		if (error) throw error;

		return (data ?? []) as Feedback[];
	},

	async insertFeedback(
		feedback: Omit<Feedback, "feedback_date">,
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
