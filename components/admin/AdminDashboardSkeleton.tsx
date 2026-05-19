"use client";

function Bone({ className }: { className: string }) {
	return (
		<div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
	);
}

function NavbarSkeleton() {
	return (
		<nav className="fixed top-0 left-0 w-full h-16 bg-surface-brand z-[9999] flex items-center px-4">
			<div className="w-full max-w-4xl mx-auto flex items-center justify-between">
				<div className="h-10 w-10 rounded-full bg-white/20" />
				<div className="h-8 w-40 rounded-xl bg-white/20" />
			</div>
		</nav>
	);
}

function ListingRowSkeleton() {
	return (
		<div className="border-b border-stroke-tertiary">
			{/* Thumbnail + info */}
			<div className="flex gap-3 px-4 pt-3 pb-2">
				<div className="w-24 h-20 flex-shrink-0 rounded-lg bg-gray-200 animate-pulse" />

				<div className="flex-1 min-w-0 flex flex-col justify-evenly">
					<Bone className="h-4 w-3/4" />
					<Bone className="h-3 w-1/2 rounded-full" />
					<Bone className="h-3 w-2/5 rounded-full" />
					<Bone className="h-3 w-28 rounded-full" />
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2 px-4 pb-3">
				<Bone className="h-8 w-20 rounded-full" />
				<Bone className="h-8 flex-1 rounded-full" />
			</div>
		</div>
	);
}

function ActivityRowSkeleton() {
	return (
		<div className="rounded-xl border border-stroke-secondary bg-surface-secondary p-3">
			<div className="flex items-start justify-between gap-2 mb-2">
				<Bone className="h-3 w-16 rounded-full" />
				<Bone className="h-3 w-20 rounded-full" />
			</div>
			<Bone className="h-4 w-3/4 mb-1.5" />
			<Bone className="h-3 w-1/2 rounded-full" />
		</div>
	);
}

export function AdminDashboardSkeleton() {
	return (
		<div className="h-svh overflow-hidden bg-surface-primary">
			<NavbarSkeleton />

			<div className="flex h-full flex-col pt-16">
				<main className="mx-auto flex w-full max-w-5xl flex-1 min-h-0 flex-col px-4">
					{/* ── Header ── */}
					<header className="flex flex-none flex-col gap-3 pt-8 pb-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="flex flex-col gap-2">
							<Bone className="h-7 w-36" />
							<Bone className="h-4 w-64" />
						</div>
						<div className="flex items-center gap-2">
							<Bone className="h-8 w-24 rounded-2xl" />
							<Bone className="h-8 w-32 rounded-2xl" />
						</div>
					</header>

					{/* ── Search + filter ── */}
					<section className="flex flex-none flex-col gap-3 pb-4 sm:flex-row">
						<Bone className="h-12 flex-1 rounded-xl" />
						<Bone className="h-12 w-44 rounded-xl" />
					</section>

					{/* ── Two-column content ── */}
					<section className="flex flex-1 min-h-0 gap-6 overflow-hidden pt-4 pb-4 flex-col lg:flex-row">
						{/* Listings column */}
						<div className="flex flex-col flex-1 min-h-0">
							<div className="flex-1 min-h-0 overflow-y-auto rounded-xl">
								<div className="flex flex-col">
									{Array.from({ length: 5 }).map((_, i) => (
										<ListingRowSkeleton key={i} />
									))}
								</div>
							</div>
						</div>

						{/* Activity column — desktop only */}
						<div className="hidden min-h-0 flex-col lg:w-80 lg:flex-none lg:flex">
							<div className="pb-3 flex-none flex flex-col gap-1.5">
								<Bone className="h-3 w-24 rounded-full" />
								<Bone className="h-5 w-32" />
							</div>
							<div className="flex-1 min-h-0 overflow-y-auto space-y-2">
								{Array.from({ length: 6 }).map((_, i) => (
									<ActivityRowSkeleton key={i} />
								))}
							</div>
						</div>
					</section>
				</main>
			</div>
		</div>
	);
}
