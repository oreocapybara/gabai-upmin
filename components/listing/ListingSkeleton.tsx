export function ListingCardSkeleton() {
    return (
        <div className="border-b border-stroke-secondary bg-surface-secondary self-stretch overflow-clip">
            <div className="flex self-stretch items-center gap-4 py-4 h-full">
                {/* Image Skeleton: Matches your 112x108 exactly */}
                <div className="w-[112px] h-[108px] bg-gray-200 animate-pulse flex-shrink-0" />

                <div className="flex flex-col flex-auto gap-2 justify-stretch">
                    <div className="flex flex-col items-start gap-2">
                        {/* Title Line */}
                        <div className="h-5 w-full bg-gray-200 animate-pulse rounded" />
                        {/* Subtitle Line (Category • Open/Closed) */}
                        <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                    </div>

                    {/* Button Row Skeleton */}
                    <div className="flex self-stretch flex-1 gap-1.5 mt-1">
                        <div className="h-8 flex-1 bg-gray-200 animate-pulse rounded-md" />
                        <div className="h-8 flex-grow bg-gray-200 animate-pulse rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}