import "server-only";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types";

const PAGE_SIZE = 25; // Adjust as needed

export const categoryService = {
    async getAllCategories(page = 0){
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE - 1;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("Category")
            .select("*")
            .range(start, end);

        if (error) throw error;

        return (data ?? []) as Category[]
    }
};