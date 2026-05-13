"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Box, Drawer } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
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

import type { Category, ListingWithCategory } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type DrawerView = "list" | "details" | "reviews";

// ─── Constants ────────────────────────────────────────────────────────────────

const PULLER_HEIGHT = 86;
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
}) {
	const mounted = useMounted();
	const isLoading = false;

	const [view, setView] = useState<DrawerView>("list");
	const [transitionView, setTransitionView] = useState<DrawerView>("list");
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [activeListing, setActiveListing] =
		useState<ListingWithCategory | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
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
		snapTo(selectionSource === "pin" ? 60 : 0);
	}, [selectedListing, selectionSource, snapTo]);

	useEffect(() => {
		if (!selectedListing) {
			lastExternalListingId.current = null;
		}
	}, [selectedListing]);

	useEffect(() => {
		if (!searchQuery) return;
		setTransitionView("list");
		setIsTransitioning(true);
		window.setTimeout(() => {
			setView("list");
			setIsTransitioning(false);
		}, 160);
		setActiveListing(null);
		setSelectedCategoryId("");
		snapTo(60);
	}, [searchQuery, snapTo]);

	const handleGoBack = useCallback(() => {
		if (view === "reviews") {
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
			setSelectedCategoryId(categoryId);
			setTransitionView("list");
			setIsTransitioning(true);
			window.setTimeout(() => {
				setView("list");
				setIsTransitioning(false);
			}, 160);
			if (snapState === 0) {
				snapTo(30);
			}
		},
		[snapState, snapTo],
	);

	// ── Derived state ──────────────────────────────────────────────────────────

	const selectedCategoryName = selectedCategoryId
		? categories.find((c) => String(c.category_id) === selectedCategoryId)
				?.category_name
		: undefined;

	const filteredListings = selectedCategoryName
		? listings.filter((l) => l.category.category_name === selectedCategoryName)
		: listings;

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
						onPointerDown={(e) => e.stopPropagation()}
					>
						<DropdownMenu
							categories={categories}
							menuPlacement={snapState === 0 ? "top" : "bottom"}
							onCategoryChange={handleCategoryChange}
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
					className="bg-surface-primary px-4 pb-4 overflow-y-auto h-full border-l-2 border-r-2 border-stroke-secondary"
					style={{ minHeight: 100, pointerEvents: "auto" }}
				>
					<div
						className={
							"transition-all duration-200 ease-out " +
							(isTransitioning
								? "opacity-0 translate-y-2"
								: "opacity-100 translate-y-0")
						}
					>
						{view === "list" && (
							<ListingList
								listings={filteredListings}
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
		</Box>
	);
}
