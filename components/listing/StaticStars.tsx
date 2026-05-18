import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { resolveStarBreakdown } from "@/lib/utils";

export function StaticStars({
	rating,
	size = "small",
	iconClassName,
}: {
	rating: number;
	size?: "small" | "inherit";
	iconClassName?: string;
}) {
	const { full, hasHalf, empty } = resolveStarBreakdown(rating);
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: full }).map((_, i) => (
				<StarIcon key={`full-${i}`} fontSize={size} className={`text-content-notice ${iconClassName ?? ""}`} />
			))}
			{hasHalf && (
				<StarHalfIcon fontSize={size} className={`text-content-notice ${iconClassName ?? ""}`} />
			)}
			{Array.from({ length: empty }).map((_, i) => (
				<StarBorderIcon key={`empty-${i}`} fontSize={size} className={`text-content-notice opacity-30 ${iconClassName ?? ""}`} />
			))}
		</div>
	);
}
