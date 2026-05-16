"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
	return (
		<Toaster
			position="top-right"
			gap={8}
			offset={80}
			toastOptions={{ unstyled: true, classNames: { toast: "w-80" } }}
		/>
	);
}
