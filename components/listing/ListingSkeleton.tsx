export function ListingCardSkeleton() {
	return (
		<div className="border-b border-stroke-secondary bg-surface-secondary self-stretch overflow-clip">
			<div className="flex self-stretch items-center gap-4 py-4 h-full">
				<div className="w-[112px] h-[108px] bg-gray-200 animate-pulse flex-shrink-0" />

				<div className="flex flex-col flex-auto gap-2 justify-stretch">
					<div className="flex flex-col items-start gap-2">
						<div className="h-5 w-full bg-gray-200 animate-pulse rounded" />
						<div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
					</div>

					<div className="flex self-stretch flex-1 gap-1.5 mt-1">
						<div className="h-8 flex-1 bg-gray-200 animate-pulse rounded-md" />
						<div className="h-8 flex-grow bg-gray-200 animate-pulse rounded-md" />
					</div>
				</div>
			</div>
		</div>
	);
}
