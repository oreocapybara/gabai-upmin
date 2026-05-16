import { useMemo, useRef, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ListingOption = {
	listing_id: string | number;
	listing_name: string;
};

type UseNavSearchReturn = {
	searchValue: string;
	showSuggestions: boolean;
	suggestions: ListingOption[];
	handleSearchChange: (value: string) => void;
	handleSearchSubmit: () => void;
	handleSuggestionSelect: (value: string) => void;
	handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	handleFocus: () => void;
	handleBlur: () => void;
};

export function useNavSearch(): UseNavSearchReturn {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const supabase = createClient();

	const debounceRef = useRef<NodeJS.Timeout | null>(null);
	const blurRef = useRef<NodeJS.Timeout | null>(null);
	const isFocusedRef = useRef(false);

	const [searchValue, setSearchValue] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [allListings, setAllListings] = useState<ListingOption[]>([]);

	// Fetch listing names once for autocomplete
	useEffect(() => {
		let active = true;
		const load = async () => {
			const { data } = await supabase
				.from("Listing")
				.select("listing_id, listing_name")
				.limit(200);
			if (!active || !data) return;
			setAllListings(
				data.map(({ listing_id, listing_name }) => ({
					listing_id,
					listing_name,
				})),
			);
		};
		load();
		return () => {
			active = false;
		};
	}, [supabase]);

	// Sync URL → input, but skip while user is typing
	useEffect(() => {
		const nextValue = searchParams.get("q") ?? "";
		if (!isFocusedRef.current) {
			setSearchValue(nextValue);
		}
	}, [searchParams]);

	const pushSearch = (value: string) => {
		const trimmed = value.trim();
		const params = new URLSearchParams();
		if (trimmed) params.set("q", trimmed);
		const query = params.toString();
		const url = query ? `/?${query}` : "/";
		// Use replace when already on home to avoid polluting history with each keystroke
		if (pathname === "/") router.replace(url);
		else router.push(url);
	};

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => pushSearch(value), 800);
	};

	const handleSearchSubmit = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushSearch(searchValue);
	};

	const handleSuggestionSelect = (value: string) => {
		setSearchValue(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushSearch(value);
		setShowSuggestions(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleSearchSubmit();
	};

	const handleFocus = () => {
		if (blurRef.current) clearTimeout(blurRef.current);
		isFocusedRef.current = true;
		setShowSuggestions(true);
	};

	const handleBlur = () => {
		isFocusedRef.current = false;
		blurRef.current = setTimeout(() => setShowSuggestions(false), 120);
	};

	const suggestions = useMemo(() => {
		const query = searchValue.trim().toLowerCase();
		if (!query) return [];
		return allListings
			.filter((l) => l.listing_name.toLowerCase().includes(query))
			.slice(0, 6);
	}, [allListings, searchValue]);

	return {
		searchValue,
		showSuggestions,
		suggestions,
		handleSearchChange,
		handleSearchSubmit,
		handleSuggestionSelect,
		handleKeyDown,
		handleFocus,
		handleBlur,
	};
}
