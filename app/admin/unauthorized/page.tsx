import Link from "next/link";

export default function AdminUnauthorizedPage() {
	return (
		<main className="min-h-screen flex items-center justify-center px-6">
			<div className="w-full max-w-md text-center">
				<h1 className="text-2xl font-semibold text-content-primary">
					Access denied
				</h1>
				<p className="mt-3 text-sm text-content-secondary">
					You are signed in, but your account does not have admin access.
				</p>
				<div className="mt-6">
					<Link
						href="/"
						className="inline-flex items-center justify-center rounded-full bg-surface-brand px-4 py-2 text-sm font-semibold text-white hover:bg-surface-brand/90"
					>
						Go back home
					</Link>
				</div>
			</div>
		</main>
	);
}
