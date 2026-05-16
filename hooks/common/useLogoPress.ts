import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function useLogoPress(
	redirectTo = "/login",
	holdMs = 5000,
	popupAfterMs = 3000,
) {
	const router = useRouter();
	const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	// Tracks whether the full-hold timer already fired so endPress knows
	// not to call refresh (navigation is already in flight).
	const navigatedRef = useRef(false);

	const [progress, setProgress] = useState(0);
	const [popupVisible, setPopupVisible] = useState(false);

	const cleanup = () => {
		if (navigateTimer.current) clearTimeout(navigateTimer.current);
		if (popupTimer.current) clearTimeout(popupTimer.current);
		if (intervalRef.current) clearInterval(intervalRef.current);
		navigateTimer.current = null;
		popupTimer.current = null;
		intervalRef.current = null;
	};

	const pressStartedAt = useRef<number>(0);

	const startPress = () => {
		cleanup();
		navigatedRef.current = false;
		pressStartedAt.current = Date.now();
		setProgress(0);
		setPopupVisible(false);

		// Fill progress bar over holdMs
		const tickMs = 16;
		const step = (tickMs / holdMs) * 100;
		intervalRef.current = setInterval(() => {
			setProgress((p) => Math.min(p + step, 100));
		}, tickMs);

		// Reveal popup only after popupAfterMs (user is clearly holding)
		popupTimer.current = setTimeout(() => {
			setPopupVisible(true);
		}, popupAfterMs);

		// Full hold → navigate
		navigateTimer.current = setTimeout(() => {
			navigatedRef.current = true;
			cleanup();
			setPopupVisible(false);
			setProgress(0);
			router.push(redirectTo);
		}, holdMs);
	};

	const endPress = () => {
		// Full-hold timer already fired — navigation is in progress, do nothing.
		if (navigatedRef.current) return;
		const heldMs = Date.now() - pressStartedAt.current;
		cleanup();
		setPopupVisible(false);
		setProgress(0);
		// Quick tap (< 200 ms) → go home. Intentional hold that didn't complete → refresh.
		if (heldMs < 200) {
			router.push("/");
		} else {
			router.refresh();
		}
	};

	return { startPress, endPress, popupVisible, progress };
}
