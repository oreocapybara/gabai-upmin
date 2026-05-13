"use client";
import { useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import SearchIcon from "@mui/icons-material/Search";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";

export default function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const blurTimerRef = useRef<NodeJS.Timeout | null>(null);
	const isSearchFocusedRef = useRef(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [allListings, setAllListings] = useState<
		{ listing_id: string | number; listing_name: string }[]
	>([]);
	const supabase = createClient();

	const startPress = () => {
		pressTimerRef.current = setTimeout(() => {
			router.push("/login");
		}, 2000);
	};

	const endPress = () => {
		if (pressTimerRef.current) {
			clearTimeout(pressTimerRef.current);
		}
	};

	useEffect(() => {
		const checkUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user && user.app_metadata?.role === "admin") {
				setIsAdmin(true);
			}
		};
		checkUser();
	}, [supabase]);

	useEffect(() => {
		let active = true;
		const loadListings = async () => {
			const { data } = await supabase
				.from("Listing")
				.select("listing_id, listing_name")
				.limit(200);
			if (!active) return;
			if (data) {
				setAllListings(
					data.map((item) => ({
						listing_id: item.listing_id,
						listing_name: item.listing_name,
					})),
				);
			}
		};
		loadListings();
		return () => {
			active = false;
		};
	}, [supabase]);

	useEffect(() => {
		const nextValue = searchParams.get("q") ?? "";
		if (!isSearchFocusedRef.current && nextValue !== searchValue) {
			setSearchValue(nextValue);
		}
	}, [searchParams]);

	const pushSearch = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		const trimmed = value.trim();
		if (trimmed) params.set("q", trimmed);
		else params.delete("q");
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname);
	};

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		// Debounce: wait 400ms after the user stops typing before updating the URL
		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		debounceTimerRef.current = setTimeout(() => pushSearch(value), 400);
	};

	const handleSearchSubmit = () => {
		// Immediately flush any pending debounce and push
		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		pushSearch(searchValue);
	};

	const handleSuggestionSelect = (value: string) => {
		setSearchValue(value);
		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		pushSearch(value);
		setShowSuggestions(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleSearchSubmit();
	};

	const suggestions = useMemo(() => {
		const query = searchValue.trim().toLowerCase();
		if (!query) return [];
		return allListings
			.filter((listing) => listing.listing_name.toLowerCase().includes(query))
			.slice(0, 6);
	}, [allListings, searchValue]);

	return (
		<nav className="fixed top-0 left-0 w-full h-16 bg-surface-brand z-[9999] flex items-center px-4">
			<div className="w-full max-w-4xl mx-auto flex items-center justify-between">
				{/* Logo — long-press to go to /login */}
				<div
					className="cursor-pointer active:scale-95 transition-transform"
					onMouseDown={startPress}
					onMouseUp={endPress}
					onMouseLeave={endPress}
					onTouchStart={startPress}
					onTouchEnd={endPress}
				>
					<div className="relative h-10 w-10 overflow-hidden rounded-full bg-brand-700">
						<Image
							src="/logo.svg"
							alt="Logo"
							fill
							priority
							className="object-contain p-1"
						/>
					</div>
				</div>

				{/* Right side: search + optional admin button */}
				<div className="flex items-center gap-2 ml-4">
					{/* Search input */}
					<div className="relative w-full max-w-xs group">
						<input
							type="text"
							placeholder="Search..."
							className="block w-full pl-3 pr-10 py-1 border border-transparent rounded-full bg-surface-primary text-sm focus:outline-none focus:bg-surface-primary focus:ring-2 focus:ring-brand-700 transition-all"
							value={searchValue}
							onChange={(e) => handleSearchChange(e.target.value)}
							onKeyDown={handleKeyDown}
							onFocus={() => {
								if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
								isSearchFocusedRef.current = true;
								setShowSuggestions(true);
							}}
							onBlur={() => {
								isSearchFocusedRef.current = false;
								blurTimerRef.current = setTimeout(
									() => setShowSuggestions(false),
									120,
								);
							}}
							aria-label="Search listings"
						/>
						{/* Search icon as a clickable submit button */}
						<button
							type="button"
							onClick={handleSearchSubmit}
							aria-label="Submit search"
							className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-700 focus:text-brand-700 transition-colors"
						>
							<SearchIcon sx={{ fontSize: 20 }} />
						</button>

						{showSuggestions && suggestions.length > 0 && (
							<div className="absolute z-[10000] mt-2 w-full rounded-2xl border border-stroke-secondary bg-surface-primary shadow-lg overflow-hidden">
								{suggestions.map((listing) => (
									<button
										key={listing.listing_id}
										type="button"
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => handleSuggestionSelect(listing.listing_name)}
										className="w-full text-left px-4 py-2 text-sm text-content-primary hover:bg-surface-hover"
									>
										{listing.listing_name}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Admin button — outside the search max-w constraint */}
					{isAdmin && (
						<button
							type="button"
							className="flex items-center justify-center p-2 rounded-full text-gray-100 hover:bg-gray-100 hover:text-brand-700 transition-all shrink-0"
							title="Customize Dashboard"
						>
							<DashboardCustomizeOutlinedIcon sx={{ fontSize: 22 }} />
						</button>
					)}
				</div>
			</div>
		</nav>
	);
}
