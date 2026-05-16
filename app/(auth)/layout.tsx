import { Suspense, type ReactNode } from "react";
import Navbar from "@/components/ui/Navbar";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<Suspense fallback={<div className="h-16 w-full bg-surface-brand" />}>
				<Navbar />
			</Suspense>
			<div className="pt-16">{children}</div>
		</>
	);
}
