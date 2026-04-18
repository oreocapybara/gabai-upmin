import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10">
				{children}
			</div>
		</main>
	);
}
