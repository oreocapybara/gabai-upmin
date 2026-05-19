"use client";

import Image from "next/image";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import { useAdminCheck } from "@/hooks/common/useAdminCheck";
import { useLogoPress } from "@/hooks/common/useLogoPress";
import { useNavSearch } from "@/hooks/common/useNavSearch";
import { SearchInput } from "@/components/ui/SearchInput";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Hold popout shell ────────────────────────────────────────────────────────

function HoldPopout({
	visible,
	children,
	className = "",
}: {
	visible: boolean;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={[
				"fixed top-[72px] z-[10000] min-w-[168px] rounded-2xl",
				"bg-surface-inverse px-4 py-3 shadow-2xl",
				"pointer-events-none select-none",
				"transition-all duration-200 ease-out",
				visible
					? "opacity-100 translate-y-0 scale-100"
					: "opacity-0 -translate-y-1 scale-95",
				className,
			].join(" ")}
		>
			{children}
		</div>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
	const isAdmin = useAdminCheck();
	const { startPress, endPress, popupVisible, progress } = useLogoPress();
	const search = useNavSearch();
	const router = useRouter();

	// Admin hold state
	const [holdProgress, setHoldProgress] = useState(0);
	const [adminPopupVisible, setAdminPopupVisible] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const adminPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const progressRef = useRef(0);
	const adminNavigatedRef = useRef(false);

	const startAdminHold = () => {
		progressRef.current = 0;
		adminNavigatedRef.current = false;
		setAdminPopupVisible(false);

		// Show popup only after 3 s of holding (same rule as logo)
		adminPopupTimerRef.current = setTimeout(() => {
			setAdminPopupVisible(true);
		}, 3000);

		// Progress ticks: 2 % every 100 ms = 5 s total
		intervalRef.current = setInterval(() => {
			progressRef.current += 2;
			if (progressRef.current >= 100) {
				clearInterval(intervalRef.current!);
				if (adminPopupTimerRef.current) clearTimeout(adminPopupTimerRef.current);
				intervalRef.current = null;
				adminPopupTimerRef.current = null;
				adminNavigatedRef.current = true;
				setHoldProgress(0);
				setAdminPopupVisible(false);
				createClient()
					.auth.signOut()
					.then(() => router.push("/"));
			} else {
				setHoldProgress(progressRef.current);
			}
		}, 100);
	};

	const endAdminHold = (navigate = false) => {
		// Full hold already fired — navigation is in progress, do nothing.
		if (adminNavigatedRef.current) return;

		const progressAtRelease = progressRef.current;

		if (intervalRef.current) clearInterval(intervalRef.current);
		if (adminPopupTimerRef.current) clearTimeout(adminPopupTimerRef.current);
		intervalRef.current = null;
		adminPopupTimerRef.current = null;
		progressRef.current = 0;

		setHoldProgress(0);
		setAdminPopupVisible(false);

		// Short tap (progress barely moved) → go to dashboard
		if (navigate && progressAtRelease <= 4) {
			router.push("/admin");
		}
	};

	// Countdown shown inside the sign-out popout (5 s total)
	const signOutSecondsLeft = Math.ceil((100 - holdProgress) / 20);

	return (
		<nav className="fixed top-0 left-0 w-full h-16 bg-surface-brand z-[9999] flex items-center px-4">
			<div className="w-full max-w-4xl mx-auto flex items-center justify-between">

				{/* ── Logo — hold 5 s to sign in, short press refreshes ─────────── */}
				<div className="relative">
					{/*
					 * Not a <Link> — navigation is fully controlled by useLogoPress:
					 *   short release → router.refresh()
					 *   full 5 s hold → router.push('/login')
					 */}
					<div
						role="button"
						aria-label="Home"
						className="cursor-pointer active:scale-95 transition-transform"
						onMouseDown={startPress}
						onMouseUp={endPress}
						onMouseLeave={endPress}
						onTouchStart={startPress}
						onTouchEnd={endPress}
						onContextMenu={(e) => e.preventDefault()}
					>
						<div className="relative h-10 w-10 overflow-hidden rounded-full bg-brand-700">
							<Image
								src="/logo.svg"
								alt="Logo"
								fill
								priority
								draggable={false}
								onContextMenu={(e) => e.preventDefault()}
								className="object-contain p-1"
							/>
						</div>
					</div>

					{/* Sign-in popout — appears after 3 s of holding */}
					<HoldPopout visible={popupVisible} className="right-4">
						<p className="text-content-inverse-primary text-xs font-semibold mb-2 leading-tight">
							Hold to sign in
						</p>
						<div className="h-1 w-full rounded-full bg-white-16 overflow-hidden">
							<div
								className="h-full bg-white rounded-full transition-[width] duration-75 ease-linear"
								style={{ width: `${progress}%` }}
							/>
						</div>
						<p className="text-content-inverse-tertiary text-[10px] mt-1.5 leading-tight">
							Release to cancel
						</p>
					</HoldPopout>
				</div>

				{/* ── Right side ────────────────────────────────────────────────── */}
				<div className="flex items-center gap-2 ml-4">
					<SearchInput
						value={search.searchValue}
						showSuggestions={search.showSuggestions}
						suggestions={search.suggestions}
						onChange={search.handleSearchChange}
						onSubmit={search.handleSearchSubmit}
						onSuggestionSelect={search.handleSuggestionSelect}
						onKeyDown={search.handleKeyDown}
						onFocus={search.handleFocus}
						onBlur={search.handleBlur}
					/>

					{isAdmin && (
						<div className="relative">
							{/* Sign-out popout — appears after 3 s of holding */}
							<HoldPopout visible={adminPopupVisible} className="left-4">
								<div className="flex items-center gap-2 mb-2">
									<div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-negative-subtle shrink-0">
										<svg
											className="w-3.5 h-3.5 text-content-negative"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
										>
											<path
												d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
									<p className="text-content-inverse-primary text-xs font-semibold leading-tight">
										Signing out in {signOutSecondsLeft}s
									</p>
								</div>
								<div className="h-1 w-full rounded-full bg-white-16 overflow-hidden">
									<div
										className="h-full bg-content-negative rounded-full transition-[width] duration-75 ease-linear"
										style={{ width: `${holdProgress}%` }}
									/>
								</div>
								<p className="text-content-inverse-tertiary text-[10px] mt-1.5 leading-tight">
									Release to cancel
								</p>
							</HoldPopout>

							{/* Admin button */}
							<div
								role="button"
								aria-label="Admin dashboard — hold to sign out"
								className="relative flex items-center justify-center p-2 rounded-full text-content-inverse-primary hover:bg-white-8 transition-all shrink-0 cursor-pointer select-none"
								onMouseDown={startAdminHold}
								onMouseUp={() => endAdminHold(true)}
								onMouseLeave={() => endAdminHold(false)}
								onTouchStart={(e) => {
									e.preventDefault();
									startAdminHold();
								}}
								onTouchEnd={() => endAdminHold(true)}
								onTouchCancel={() => endAdminHold(false)}
								onContextMenu={(e) => e.preventDefault()}
							>
								{holdProgress > 0 && (
									<svg
										className="absolute inset-0 pointer-events-none -rotate-90"
										width="38"
										height="38"
										viewBox="0 0 38 38"
									>
										<circle
											cx="19"
											cy="19"
											r={RING_RADIUS}
											fill="none"
											stroke="var(--content-negative)"
											strokeWidth="2"
											strokeLinecap="round"
											strokeDasharray={RING_CIRCUMFERENCE}
											strokeDashoffset={
												RING_CIRCUMFERENCE * (1 - holdProgress / 100)
											}
										/>
									</svg>
								)}
								<DashboardCustomizeOutlinedIcon sx={{ fontSize: 22 }} />
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
