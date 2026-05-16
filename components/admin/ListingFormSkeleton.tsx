"use client";

function Bone({ className }: { className: string }) {
	return (
		<div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
	);
}

function SectionLabelSkeleton() {
	return <Bone className="h-3 w-28 rounded-full" />;
}

function InputSkeleton({ className }: { className?: string }) {
	return <Bone className={`h-12 w-full rounded-xl ${className ?? ""}`} />;
}

function CardSkeleton({ children }: { children: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-stroke-secondary bg-surface-secondary p-4 flex flex-col gap-4">
			{children}
		</div>
	);
}

export function ListingFormSkeleton() {
	return (
		<div className="mx-auto max-w-xl px-4 pt-6 pb-32">
			{/* ── Page header ── */}
			<div className="mb-6 flex flex-col gap-2">
				<Bone className="h-7 w-36" />
				<Bone className="h-4 w-64 rounded-full" />
			</div>

			<div className="flex flex-col gap-5">
				{/* ── 1. Image ── */}
				<div className="flex flex-col gap-1.5">
					<SectionLabelSkeleton />
					<Bone className="aspect-square w-full rounded-2xl" />
				</div>

				{/* ── 2. Basic information ── */}
				<div className="flex flex-col gap-1.5">
					<SectionLabelSkeleton />
					<CardSkeleton>
						{/* Category dropdown */}
						<InputSkeleton />
						{/* Name */}
						<InputSkeleton />
						{/* Description textarea */}
						<Bone className="h-28 w-full rounded-xl" />
					</CardSkeleton>
				</div>

				{/* ── 3. Location ── */}
				<div className="flex flex-col gap-1.5">
					<SectionLabelSkeleton />
					<CardSkeleton>
						<div className="flex gap-3">
							<InputSkeleton className="flex-1" />
							<InputSkeleton className="flex-1" />
						</div>
					</CardSkeleton>
				</div>

				{/* ── 4. Hours & price ── */}
				<div className="flex flex-col gap-1.5">
					<SectionLabelSkeleton />
					<CardSkeleton>
						{/* Time inputs */}
						<div className="flex gap-3">
							<InputSkeleton className="flex-1" />
							<InputSkeleton className="flex-1" />
						</div>
						{/* Price inputs */}
						<div className="flex gap-3">
							<InputSkeleton className="flex-1" />
							<InputSkeleton className="flex-1" />
						</div>
						{/* Hint text */}
						<Bone className="h-3 w-4/5 rounded-full -mt-2" />
					</CardSkeleton>
				</div>
			</div>

			{/* ── Sticky action bar ── */}
			<div className="fixed inset-x-0 bottom-0 border-t border-stroke-secondary bg-surface-primary/95 backdrop-blur">
				<div className="mx-auto flex max-w-xl gap-3 p-4">
					<Bone className="h-10 flex-1 rounded-2xl" />
					<Bone className="h-10 flex-1 rounded-2xl" />
				</div>
			</div>
		</div>
	);
}
