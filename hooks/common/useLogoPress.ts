import { useRef } from "react";
import { useRouter } from "next/navigation";

export function useLogoPress(redirectTo = "/login", delay = 2000) {
	const router = useRouter();
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const startPress = () => {
		timerRef.current = setTimeout(() => router.push(redirectTo), delay);
	};

	const endPress = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
	};

	return { startPress, endPress };
}
