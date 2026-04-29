// This file contails logic to handle everything related to the map pins and building details
import { createClient } from "@/lib/supabase/client";
import type { ListingWithCategory } from "@/types";

const supabase = createClient();
const PAGE_SIZE = 25; // Adjust as needed

export const listingService = {
	// Fetch listings with pagination
	async getAllListings(page = 0) {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE - 1;

        // Note: No <Listing> here. Supabase knows what "Listing" is 
        // because your createClient() used the <Database> type.
        const { data, error } = await supabase
            .from("Listing")
            .select("*, category:category_id (category_name)")
            .range(start, end);

        if (error) throw error;
        
        // Return type is inferred, but casting ensures your UI gets the clean Listing type
        return (data ?? []) as ListingWithCategory[];
	},

	// Fetch listing by specific category with pagination
	async getListingByCategory(categoryId: number, page = 0) {
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE - 1;

        const { data, error } = await supabase
            .from("Listing")
            .select("*, category:category_id (category_name)")
            .eq("category_id", categoryId)
            .range(start, end);

        if (error) throw error;
        return (data ?? []) as ListingWithCategory[];
    },
};

// const page1 = await listingService.getAllListings(0);  // First 50
// const page2 = await listingService.getAllListings(1);  // Next 50
