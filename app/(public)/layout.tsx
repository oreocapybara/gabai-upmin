import Navbar from "@/components/ui/Navbar";
import { Suspense, type ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="min-h-screen w-screen max-w-7xl flex flex-col">
				<Suspense fallback={<div className="h-16 w-full bg-surface-brand" />}>
					<Navbar />
				</Suspense>
				{children}
			</div>
		</main>
	);
}
