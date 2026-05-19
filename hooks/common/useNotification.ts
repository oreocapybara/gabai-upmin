"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type NotificationVariant = "success" | "error";

export interface NotificationState {
	message: string;
	variant: NotificationVariant;
}

export function useNotification(autoDismissMs = 4500) {
	const [notification, setNotification] = useState<NotificationState | null>(null);
	const [visible, setVisible] = useState(false);
	const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearTimers = useCallback(() => {
		if (dismissTimer.current) clearTimeout(dismissTimer.current);
		if (removeTimer.current) clearTimeout(removeTimer.current);
	}, []);

	const dismiss = useCallback(() => {
		clearTimers();
		setVisible(false);
		// Wait for the exit animation before unmounting content
		removeTimer.current = setTimeout(() => setNotification(null), 350);
	}, [clearTimers]);

	const notify = useCallback(
		(message: string, variant: NotificationVariant = "success") => {
			clearTimers();
			setNotification({ message, variant });
			// Double rAF ensures the element is in the DOM before the enter class fires
			requestAnimationFrame(() =>
				requestAnimationFrame(() => setVisible(true)),
			);
			// Errors stay until manually dismissed; success auto-dismisses
			if (variant === "success") {
				dismissTimer.current = setTimeout(dismiss, autoDismissMs);
			}
		},
		[clearTimers, dismiss, autoDismissMs],
	);

	useEffect(() => clearTimers, [clearTimers]);

	return { notification, visible, notify, dismiss };
}
