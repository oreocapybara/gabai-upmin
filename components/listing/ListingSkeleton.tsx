export function ListingCardSkeleton() {
	return (
		<div className="border-b border-stroke-tertiary">
			{/* Thumbnail + info */}
			<div className="flex gap-3 px-4 pt-3 pb-2">
				<div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-200 animate-pulse" />

				<div className="flex-1 min-w-0 flex flex-col gap-0.5">
					{/* Name */}
					<div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
					<div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mt-0.5" />

					{/* Category · Status */}
					<div className="h-3 w-2/5 bg-gray-200 animate-pulse rounded mt-0.5" />

					{/* Price */}
					<div className="h-3 w-1/4 bg-gray-200 animate-pulse rounded mt-0.5" />

					{/* Rating */}
					<div className="h-3 w-28 bg-gray-200 animate-pulse rounded mt-0.5" />
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2 px-4 pb-3">
				<div className="h-8 w-20 bg-gray-200 animate-pulse rounded-full" />
				<div className="h-8 flex-1 bg-gray-200 animate-pulse rounded-full" />
			</div>
		</div>
	);
}
