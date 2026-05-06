export default function Loading() {
	return (
		<main className="flex min-h-screen w-screen items-center justify-center bg-slate-50">
			<div className="flex w-full max-w-md flex-col gap-4 px-6">
				<div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
				<div className="h-24 w-full animate-pulse rounded bg-slate-200" />
				<div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
				<div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
			</div>
		</main>
	);
}
