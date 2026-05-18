"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Box, Drawer } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DirectionsIcon from "@mui/icons-material/Directions";
import { ChevronLeft } from "lucide-react";

import { ListingDetails } from "@/components/listing/ListingDetails";
import { ReviewSection } from "@/components/listing/ReviewSection";
import ListingList from "@/components/listing/ListingList";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { NotificationBanner } from "@/components/ui/NotificationBanner";

// Moved: hooks/drawer → hooks/common (not drawer-specific)
import { useMounted } from "@/hooks/common/useMounted";
import {
	DRAWER_SNAP_DURATION_MS,
	DRAWER_SPRING,
	type SnapPoint,
	useDraggableDrawer,
} from "@/hooks/drawer/useDraggableDrawer";

import { isListingOpen } from "@/lib/utils";
import { useAllRatings } from "@/hooks/listing/useAllRatings";
import type { Category, ListingWithCategory } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type DrawerView = "list" | "details" | "reviews";
type SortOption = "default" | "open-first" | "price-asc" | "rating-desc" | "rating-asc";

// ─── Constants ────────────────────────────────────────────────────────────────

const PULLER_HEIGHT = 90; //in px
const SNAP_POINTS: SnapPoint[] = [0, 30, 60, 90];

// ─── Component ────────────────────────────────────────────────────────────────

export function MainDrawer({
	listings,
	categories,
	onDirections,
	selectedListing,
	onSelectListing,
	directionsListing,
	onSnapChange,
	searchQuery,
	selectionSource,
	initialCategoryId = "",
	selectedCategoryId = "",
	onCategoryChange,
}: {
	listings: ListingWithCategory[];
	categories: Category[];
	onDirections?: (listing: ListingWithCategory) => void;
	selectedListing?: ListingWithCategory | null;
	onSelectListing?: (listing: ListingWithCategory) => void;
	directionsListing?: ListingWithCategory | null;
	onSnapChange?: (snap: SnapPoint) => void;
	searchQuery?: string;
	selectionSource?: "pin" | "list" | null;
	initialCategoryId?: string;
	selectedCategoryId?: string;
	onCategoryChange?: (categoryId: string) => void;
}) {
	const mounted = useMounted();
	const isLoading = false;

	const [view, setView] = useState<DrawerView>("list");
	const [, setTransitionView] = useState<DrawerView>("list");
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [activeListing, setActiveListing] =
		useState<ListingWithCategory | null>(null);
	const [sortBy, setSortBy] = useState<SortOption>("default");
	const allRatings = useAllRatings();
	const [pendingRating, setPendingRating] = useState(0);
	const [reviewToast, setReviewToast] = useState<{
		variant: "success" | "error";
		title: string;
		message: string;
	} | null>(null);

	const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastExternalListingId = useRef<string | number | null>(null);

	// ── Snap-zero callback ─────────────────────────────────────────────────────

	const handleSnapZero = useCallback(() => {
		// Delay view reset so the close animation completes first
		resetTimerRef.current = setTimeout(() => {
			setView("list");
			setActiveListing(null);
		}, DRAWER_SNAP_DURATION_MS);
	}, []);

	useEffect(
		() => () => {
			if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
		},
		[],
	);

	// ── Drawer drag hook
	const {
		snapState,
		isDragging,
		snapTo,
		snapToPx,
		onPointerDown,
		onPointerMove,
		onPointerUp,
	} = useDraggableDrawer({
		onSnapZero: handleSnapZero,
		pullerHeight: PULLER_HEIGHT,
		snapPoints: SNAP_POINTS,
		dragThresholdPx: 32,
	});

	useEffect(() => {
		onSnapChange?.(snapState);
	}, [onSnapChange, snapState]);

	// ── Directions banner animation state ─────────────────────────────────────
	// Keep a stable listing reference so the name stays visible during exit anim.
	const [bannerListing, setBannerListing] = useState<ListingWithCategory | null>(null);
	const [bannerVisible, setBannerVisible] = useState(false);
	const bannerHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const shouldShow = !!directionsListing && snapState === 0 && !isDragging;
		if (shouldShow) {
			if (bannerHideTimerRef.current) clearTimeout(bannerHideTimerRef.current);
			setBannerListing(directionsListing);
			requestAnimationFrame(() => setBannerVisible(true));
		} else {
			setBannerVisible(false);
			bannerHideTimerRef.current = setTimeout(() => setBannerListing(null), 300);
		}
		return () => {
			if (bannerHideTimerRef.current) clearTimeout(bannerHideTimerRef.current);
		};
	}, [directionsListing, snapState, isDragging]);

	useEffect(() => {
		if (initialCategoryId) snapTo(30);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Navigation handlers ────────────────────────────────────────────────────

	const handleOpenDetails = useCallback(
		(listing: ListingWithCategory) => {
			setActiveListing(listing);
			setTransitionView("details");
			setIsTransitioning(true);
			window.setTimeout(() => {
				setView("details");
				setIsTransitioning(false);
			}, 160);
			onSelectListing?.(listing);
		},
		[onSelectListing],
	);

	const handleDirections = useCallback(
		(listing: ListingWithCategory) => {
			onDirections?.(listing);
			snapTo(0); // close the drawe state during directions
		},
		[onDirections, snapTo],
	);

	useEffect(() => {
		if (!selectedListing) return;
		if (lastExternalListingId.current === selectedListing.listing_id) return;
		lastExternalListingId.current = selectedListing.listing_id;
		setActiveListing(selectedListing);
		setTransitionView("details");
		setIsTransitioning(true);
		window.setTimeout(() => {
			setView("details");
			setIsTransitioning(false);
		}, 160);
		snapTo(selectionSource === "pin" ? 90 : 0);
	}, [selectedListing, selectionSource, snapTo]);

	useEffect(() => {
		if (!selectedListing) {
			lastExternalListingId.current = null;
		}
	}, [selectedListing]);

	useEffect(() => {
		if (!searchQuery) return;
		setSortBy("default");
		setTransitionView("list");
		setIsTransitioning(true);
		window.setTimeout(() => {
			setView("list");
			setIsTransitioning(false);
		}, 160);
		setActiveListing(null);
		onCategoryChange?.("");
		snapTo(60);
	}, [onCategoryChange, searchQuery, snapTo]);

	const handleGoBack = useCallback(() => {
		if (view === "reviews") {
			setPendingRating(0);
			setTransitionView("details");
			setIsTransitioning(true);
			window.setTimeout(() => {
				setView("details");
				setIsTransitioning(false);
			}, 160);
		} else {
			setTransitionView("list");
			setIsTransitioning(true);
			window.setTimeout(() => {
				setView("list");
				setIsTransitioning(false);
			}, 160);
			setActiveListing(null);
		}
	}, [view]);

	const handleReviewSuccess = useCallback(() => {
		setTransitionView("details");
		setIsTransitioning(true);
		window.setTimeout(() => {
			setView("details");
			setIsTransitioning(false);
		}, 160);
		setPendingRating(0);
		setReviewToast({
			variant: "success",
			title: "Review submitted",
			message: "Thanks for sharing your feedback.",
		});
	}, []);

	const handleReviewError = useCallback((message: string) => {
		setReviewToast({
			variant: "error",
			title: "Review failed",
			message,
		});
	}, []);

	const handleActionButton = useCallback(() => {
		if (view === "list") snapTo(0);
		else handleGoBack();
	}, [view, snapTo, handleGoBack]);

	const handleCategoryChange = useCallback(
		(categoryId: string) => {
			onCategoryChange?.(categoryId);
			setSortBy("default");
			setTransitionView("list");
			setIsTransitioning(true);
			window.setTimeout(() => {
				setView("list");
				setIsTransitioning(false);
			}, 160);
			if (snapState === 0) {
				snapTo(60);
			}
		},
		[onCategoryChange, snapState, snapTo],
	);

	// ── Derived state ──────────────────────────────────────────────────────────

	const selectedCategoryName = selectedCategoryId
		? categories.find((c) => String(c.category_id) === selectedCategoryId)
				?.category_name
		: undefined;

	const filteredListings = selectedCategoryName
		? listings.filter((l) => l.category.category_name === selectedCategoryName)
		: listings;

	const sortedListings = useMemo(() => {
		const list = [...filteredListings];
		switch (sortBy) {
			case "open-first":
				return list.sort((a, b) => {
					const aOpen = isListingOpen(a.opening_hours, a.closing_hours) ? 0 : 1;
					const bOpen = isListingOpen(b.opening_hours, b.closing_hours) ? 0 : 1;
					return aOpen - bOpen;
				});
			case "price-asc":
				return list.sort((a, b) => {
					const aPrice = a.price_min ?? Infinity;
					const bPrice = b.price_min ?? Infinity;
					return aPrice - bPrice;
				});
			case "rating-desc":
				return list.sort((a, b) => {
					const aR = allRatings[a.listing_id] ?? -1;
					const bR = allRatings[b.listing_id] ?? -1;
					return bR - aR;
				});
			case "rating-asc":
				return list.sort((a, b) => {
					const aR = allRatings[a.listing_id] ?? Infinity;
					const bR = allRatings[b.listing_id] ?? Infinity;
					return aR - bR;
				});
			default:
				return list.sort((a, b) =>
					a.listing_name.localeCompare(b.listing_name),
				);
		}
	}, [filteredListings, sortBy, allRatings]);

	const directionsListingId = directionsListing?.listing_id ?? null;

	// ── SSR guard ─────────────────────────────────────────────────────────────

	if (!mounted) {
		return (
			<div
				suppressHydrationWarning
				style={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					height: PULLER_HEIGHT,
					pointerEvents: "none",
				}}
			/>
		);
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<Box suppressHydrationWarning sx={{ pointerEvents: "none" }}>
			<Drawer
				anchor="bottom"
				open={mounted}
				onClose={() => snapTo(0)}
				hideBackdrop
				ModalProps={{
					keepMounted: true,
					disableAutoFocus: true,
					disableEnforceFocus: true,
					disableRestoreFocus: true,
					style: { pointerEvents: "none" },
				}}
				sx={{
					"& .MuiDrawer-paper": {
						overflow: "visible",
						zIndex: 2000,
						height: snapToPx(snapState),
						transition: `height ${DRAWER_SNAP_DURATION_MS}ms ${DRAWER_SPRING}`,
						boxShadow: snapState === 0 ? "none" : undefined,
						pointerEvents: snapState === 0 ? "none" : "auto",
					},
				}}
			>
				{/* ── Puller tab ── */}
				<Box
					className="absolute left-0 right-0 flex flex-col items-center bg-surface-primary border-t-2 border-l-2 border-r-2 border-stroke-secondary rounded-t-3xl select-none"
					style={{
						top: -PULLER_HEIGHT,
						height: PULLER_HEIGHT,
						visibility: "visible",
						pointerEvents: "auto",
						touchAction: "none",
						cursor: "grab",
					}}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
				>
					<Box
						data-drag-handle
						className="w-16 h-1 rounded-full bg-stroke-tertiary mt-4 mb-3 pointer-events-none"
					/>

					<Box
						className="flex w-full justify-between items-center px-4"
						onPointerDown={(e) => { if (snapState !== 0) e.stopPropagation(); }}
					>
						<DropdownMenu
							categories={categories}
							menuPlacement={snapState <= 30 ? "top" : "bottom"}
							onCategoryChange={handleCategoryChange}
							defaultValue={initialCategoryId}
						/>
						<Button
							variant="mono"
							size="icon"
							className="flex items-center justify-center rounded-full border border-stroke-secondary bg-surface-primary shadow-sm hover:bg-surface-hover active:bg-surface-pressed transition-colors [&_svg]:!size-5"
							onClick={handleActionButton}
						>
							{view !== "list" ? (
								<ChevronLeft className="text-content-secondary" />
							) : (
								<CloseRoundedIcon className="text-content-secondary" />
							)}
						</Button>
					</Box>
				</Box>

				{/* ── Scrollable content ── */}
				<Box
					className="bg-surface-primary pb-4 overflow-y-auto overflow-x-hidden h-full border-l-2 border-r-2 border-stroke-secondary"
					style={{
						minHeight: 100,
						pointerEvents: "auto",
						paddingLeft: "min(1rem, 4vw)",
						paddingRight: "min(1rem, 4vw)",
					}}
				>
					<div
						className={
							"transition-all duration-200 ease-out " +
							(isTransitioning
								? "opacity-0 translate-y-2"
								: "opacity-100 translate-y-0")
						}
					>
						{/* ── Sort chips — sticky single row, slides in when drawer opens ── */}
						{view === "list" && (
							<div
								className={[
									"sticky top-0 z-10 -mx-4 px-4 bg-surface-primary",
									"overflow-hidden transition-all duration-300 ease-out",
									snapState >= 60
										? "max-h-[52px] opacity-100 pt-3 pb-2 border-b border-stroke-tertiary"
										: "max-h-0 opacity-0 pointer-events-none",
								].join(" ")}
							>
								<div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
									{(
										[
											{ key: "default",     label: "A – Z"      },
											{ key: "open-first",  label: "Open first" },
											{ key: "price-asc",   label: "Price ↑"   },
											{ key: "rating-desc", label: "Rating ↓"  },
											{ key: "rating-asc",  label: "Rating ↑"  },
										] as { key: SortOption; label: string }[]
									).map(({ key, label }) => (
										<button
											key={key}
											onClick={() => setSortBy(sortBy === key ? "default" : key)}
											className={[
												"shrink-0 rounded-full px-3 py-1 text-xs font-medium",
												"border transition-colors duration-150",
												sortBy === key
													? "bg-surface-brand border-surface-brand text-content-inverse-primary"
													: "bg-surface-primary border-stroke-secondary text-content-secondary hover:bg-surface-hover",
											].join(" ")}
										>
											{label}
										</button>
									))}
								</div>
							</div>
						)}

						{view === "list" && (
							<ListingList
								listings={sortedListings}
								isLoading={isLoading}
								onDetails={handleOpenDetails}
								onDirections={handleDirections}
								directionsListingId={directionsListingId}
							/>
						)}

						{view === "details" && activeListing && (
							<ListingDetails
								listing={activeListing}
								onSeeReviews={() => {
									setTransitionView("reviews");
									setIsTransitioning(true);
									window.setTimeout(() => {
										setView("reviews");
										setIsTransitioning(false);
									}, 160);
								}}
								onDirections={handleDirections}
								isDirectionsActive={
									directionsListingId === activeListing.listing_id
								}
								onRate={(rating) => {
									setPendingRating(rating);
									setTransitionView("reviews");
									setIsTransitioning(true);
									window.setTimeout(() => {
										setView("reviews");
										setIsTransitioning(false);
									}, 160);
								}}
							/>
						)}

						{view === "reviews" && activeListing && (
							<ReviewSection
								listing={activeListing}
								onDetails={() => {
									setTransitionView("details");
									setIsTransitioning(true);
									window.setTimeout(() => {
										setView("details");
										setIsTransitioning(false);
									}, 160);
								}}
								onDirections={handleDirections}
								initialRating={pendingRating}
								onSubmitSuccess={handleReviewSuccess}
								onSubmitError={handleReviewError}
								isDirectionsActive={
									directionsListingId === activeListing.listing_id
								}
							/>
						)}
					</div>
				</Box>
			</Drawer>

			{reviewToast && (
				<NotificationBanner
					variant={reviewToast.variant}
					title={reviewToast.title}
					className="fixed top-20 right-4 z-[2200]"
					autoHideMs={3500}
					onDismiss={() => setReviewToast(null)}
				>
					{reviewToast.message}
				</NotificationBanner>
			)}

			{/* ── Active directions banner — animates in/out above the puller ── */}
			{bannerListing && (
				<div
					className={[
						// left-4 matches the locate-button's right-4 margin on the opposite side.
						// right-[64px] = 40px (locate btn) + 8px gap + 16px screen edge — keeps
						// both controls in a visual row without putting them in the same component.
						"fixed left-4 right-[64px] flex pointer-events-none z-[2100]",
						"transition-all duration-300 ease-out",
						bannerVisible
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-3 pointer-events-none",
					].join(" ")}
					style={{ bottom: PULLER_HEIGHT + 8 }}
				>
					<div className="pointer-events-auto flex items-center gap-2.5 bg-surface-brand text-content-inverse-primary pl-4 pr-2 py-2.5 rounded-2xl shadow-lg w-full">
						<DirectionsIcon className="!text-[20px] shrink-0 opacity-90" />
						<div className="flex flex-col flex-1 min-w-0">
							<span className="text-[10px] font-medium opacity-70 leading-tight uppercase tracking-wide">
								Navigating to
							</span>
							<span className="text-s font-semibold truncate leading-tight mt-0.5">
								{bannerListing.listing_name}
							</span>
						</div>
						<button
							aria-label="Stop directions"
							onClick={() => onDirections?.(bannerListing)}
							className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors shrink-0"
						>
							<CloseRoundedIcon className="!text-[18px]" />
						</button>
					</div>
				</div>
			)}
		</Box>
	);
}
