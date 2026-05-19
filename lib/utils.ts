import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatCategoryName = (name: string) => {
	const normalized = name.toLowerCase();
	if (normalized === "canteen-eatery") return "Canteen / Eatery";
	if (normalized === "clinic-hospital") return "Clinic / Hospital";

	return name
		.replace(/[-_]/g, " ")
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word[0]?.toUpperCase() + word.slice(1))
		.join(" ");
};

export function isListingOpen(
	opening: string | null,
	closing: string | null,
): boolean {
	if (!opening || !closing) return false;
	const now = new Date();
	const current = now.getHours() * 60 + now.getMinutes();
	const [openH, openM] = opening.split(":").map(Number);
	const [closeH, closeM] = closing.split(":").map(Number);
	const open = openH * 60 + openM;
	const close = closeH * 60 + closeM;
	return close < open
		? current >= open || current < close
		: current >= open && current < close;
}

export type ListingHoursStatus = "open" | "closed" | "unknown";

export function getListingHoursStatus(
	opening: string | null,
	closing: string | null,
): ListingHoursStatus {
	if (!opening || !closing) return "unknown";
	return isListingOpen(opening, closing) ? "open" : "closed";
}

export function formatPriceRange(
	min: number | null,
	max: number | null,
): string {
	if (min === 0 && max === null) return "Free";
	if (min !== null && max !== null) return `₱${min} – ₱${max}`;
	if (min !== null) return `₱${min}`;
	if (max !== null) return `up to ₱${max}`;
	return "";
}

// ─── Relative time ────────────────────────────────────────────────────────────

const _rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(dateString: string): string {
	const diffMs = Date.now() - new Date(dateString).getTime();
	const diffSecs = Math.floor(diffMs / 1000);

	if (diffSecs < 60) return "Just now";

	const diffMins = Math.floor(diffSecs / 60);
	if (diffMins < 60) return _rtf.format(-diffMins, "minute");

	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return _rtf.format(-diffHours, "hour");

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) return _rtf.format(-diffDays, "day");
	if (diffDays < 28) return _rtf.format(-Math.floor(diffDays / 7), "week");
	if (diffDays < 365) return _rtf.format(-Math.floor(diffDays / 30), "month");
	return _rtf.format(-Math.floor(diffDays / 365), "year");
}

// ─── Star rating ──────────────────────────────────────────────────────────────

export interface StarBreakdown {
	full: number;
	hasHalf: boolean;
	empty: number;
}

/**
 * Breaks a decimal rating (e.g. 3.5) into integer star counts safe for
 * rendering with individual icon components. Rounds to nearest 0.5.
 */
export function resolveStarBreakdown(rating: number): StarBreakdown {
	const rounded = Math.round(rating * 2) / 2;
	const full = Math.floor(rounded);
	const hasHalf = rounded - full === 0.5;
	const empty = 5 - full - (hasHalf ? 1 : 0);
	return { full, hasHalf, empty };
}
