import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="min-h-screen w-screen max-w-7xl flex-col">
				{children}
			</div>
		</main>
	);
}
