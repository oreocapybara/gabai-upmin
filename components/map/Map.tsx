"use client";
import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import type { ListingWithCategory } from "@/types";
import { MapMarker } from "./MapMarker";
import { useMap } from "@/hooks/map/useMap";
import { useGeolocation } from "@/hooks/map/useGeolocation";
import { useDirections } from "@/hooks/map/useDirections";
import { useClusterer } from "@/hooks/map/useClusterer";
import { UserMarker } from "./UserMarker";
import { Button } from "@/components/ui/Button";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { cn } from "@/lib/utils";
const MyLocationRounded = dynamic(
	() => import("@mui/icons-material/MyLocationRounded"),
	{ ssr: false },
);

interface MapProps {
	initialListings: ListingWithCategory[];
	directionsListing?: ListingWithCategory | null;
	selectedListingId?: ListingId | null;
	onSelectListing?: (listing: ListingWithCategory) => void;
	drawerSnapState?: number;
	selectedCategoryName?: string;
}

type ListingId = ListingWithCategory["listing_id"];

export default function Map({
	initialListings,
	directionsListing,
	selectedListingId,
	onSelectListing,
	drawerSnapState = 0,
	selectedCategoryName,
}: MapProps) {
	const [isHydrated, setIsHydrated] = useState(false);
	const [showMapError, setShowMapError] = useState(false);
	const [showGeoError, setShowGeoError] = useState(false);
	const [showGeoSupportError, setShowGeoSupportError] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const { map, mapError } = useMap(containerRef);

	const { position, error: geoError, isSupported } = useGeolocation();

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	useEffect(() => {
		setShowMapError(Boolean(mapError));
	}, [mapError]);

	useEffect(() => {
		setShowGeoError(Boolean(geoError));
	}, [geoError]);

	useEffect(() => {
		setShowGeoSupportError(!isSupported);
	}, [isSupported]);

	const selectedListing = useMemo(
		() =>
			initialListings.find((l) => l.listing_id === selectedListingId) ?? null,
		[initialListings, selectedListingId],
	);

	// Derive destination from directions listing — null clears the route
	const destination = directionsListing
		? {
				lat: directionsListing.coord_latitude,
				lng: directionsListing.coord_longitude,
			}
		: null;

	const isRouteActive = Boolean(destination && position);
	const isLocateDisabled = !isHydrated || !position;
	const isDrawerOpen = drawerSnapState > 0;

	const handleSelect = useCallback(
		(listing: ListingWithCategory) => {
			onSelectListing?.(listing);
		},
		[onSelectListing],
	);

	const handleLocate = useCallback(() => {
		if (!map || !position) return;

		const bounds = map.getBounds();
		const isInView = bounds?.contains(position) ?? false;

		if (!isInView) {
			animatePanTo(map, position, { durationMs: 800 });
			const zoom = map.getZoom();
			if (zoom !== undefined && zoom < 17) {
				setTimeout(() => {
					map.setZoom(17);
				}, 800);
			}
			return;
		}

		animatePanTo(map, position, { durationMs: 500 });
	}, [map, position]);

	const clusterer = useClusterer(map, !isRouteActive);

	const markersToRender = useMemo(() => {
		if (isRouteActive && directionsListing) return [directionsListing];
		if (selectedCategoryName) {
			return initialListings.filter(
				(l) => l.category?.category_name === selectedCategoryName,
			);
		}
		return initialListings;
	}, [directionsListing, initialListings, isRouteActive, selectedCategoryName]);

	// Use directions hook to render route when destination and user position are available
	useDirections({
		map,
		userPosition: position,
		destination,
	});

	return (
		<div className="relative w-screen mt-16 h-[calc(100svh-4rem)]">
			<div className="h-full w-full relative z-0" ref={containerRef} />

			{(showMapError || showGeoError || showGeoSupportError) && (
				<div className="fixed top-[72px] right-4 z-[10000] flex flex-col gap-s">
					{mapError && showMapError && (
						<NotificationBanner
							variant="error"
							isFloating={false}
							title="Map error"
							autoHideMs={5000}
							onDismiss={() => setShowMapError(false)}
						>
							Failed to load map: {mapError.message}
						</NotificationBanner>
					)}
					{!isSupported && showGeoSupportError && (
						<NotificationBanner
							variant="warning"
							isFloating={false}
							title="Geolocation"
							autoHideMs={5000}
							onDismiss={() => setShowGeoSupportError(false)}
						>
							Geolocation is not supported on this device.
						</NotificationBanner>
					)}
					{geoError && showGeoError && (
						<NotificationBanner
							variant="error"
							isFloating={false}
							title="Location error"
							autoHideMs={5000}
							onDismiss={() => setShowGeoError(false)}
						>
							{geoError.message}
						</NotificationBanner>
					)}
				</div>
			)}

			<UserMarker map={map} position={position} />

			<Button
				type="button"
				variant="secondary"
				size="icon"
				className={cn(
					"absolute right-4 z-50 h-10 w-10 shadow-md transition-all duration-300",
					isDrawerOpen
						? "opacity-0 pointer-events-none bottom-4"
						: "opacity-100 bottom-[98px]",
				)}
				onClick={handleLocate}
				disabled={isLocateDisabled}
				suppressHydrationWarning
				aria-label="Locate current position"
			>
				<MyLocationRounded className={cn("w-9 h-9")} />
			</Button>

			{map &&
				markersToRender.map((item) => (
					<MapMarker
						key={item.listing_id}
						map={map}
						listing={item}
						isSelected={selectedListingId === item.listing_id}
						onSelect={handleSelect}
						clusterer={isRouteActive ? null : clusterer}
					/>
				))}
		</div>
	);
}

function animatePanTo(
	map: google.maps.Map,
	target: google.maps.LatLngLiteral,
	opts?: { durationMs?: number },
) {
	const duration = opts?.durationMs ?? 700;
	const start = map.getCenter();
	if (!start) {
		map.setCenter(target);
		return;
	}

	const startLat = start.lat();
	const startLng = start.lng();
	const deltaLat = target.lat - startLat;
	const deltaLng = target.lng - startLng;

	const startTime = performance.now();
	const easeInOut = (t: number) =>
		t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

	const step = (now: number) => {
		const elapsed = now - startTime;
		const t = Math.min(1, elapsed / duration);
		const eased = easeInOut(t);

		map.setCenter({
			lat: startLat + deltaLat * eased,
			lng: startLng + deltaLng * eased,
		});

		if (t < 1) requestAnimationFrame(step);
	};

	requestAnimationFrame(step);
}
