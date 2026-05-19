"use client";
import { useRef, useState, useCallback, useMemo, useEffect, type MutableRefObject } from "react";
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
	const [isTracking, setIsTracking] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const isTrackingRef = useRef(false);
	const flyRafRef = useRef<number | null>(null);
	const justActivatedRef = useRef(false);
	const { map, mapError } = useMap(containerRef);

	const { position, error: geoError, isSupported } = useGeolocation();

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	useEffect(() => {
		setShowMapError(Boolean(mapError));
	}, [mapError]);

	useEffect(() => {
		if (geoError) setShowGeoError(true);
	}, [geoError]);

	useEffect(() => {
		// isHydrated guard: isSupported starts false before the navigator check runs,
		// which would fire a false "not supported" banner on every mount.
		if (!isHydrated) return;
		setShowGeoSupportError(!isSupported);
	}, [isSupported, isHydrated]);

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

	// Break tracking the moment the user manually drags the map.
	useEffect(() => {
		if (!map) return;
		const listener = map.addListener("dragstart", () => {
			if (!isTrackingRef.current) return;
			cancelFly(flyRafRef);
			isTrackingRef.current = false;
			setIsTracking(false);
		});
		return () => google.maps.event.removeListener(listener);
	}, [map]);

	// Follow the user whenever tracking is active and position updates.
	// Skip the very first run — flyToPosition handles the initial pan.
	useEffect(() => {
		if (!isTracking || !map || !position) return;
		if (justActivatedRef.current) {
			justActivatedRef.current = false;
			return;
		}
		cancelFly(flyRafRef);
		map.panTo(position);
	}, [isTracking, position, map]);

	const handleSelect = useCallback(
		(listing: ListingWithCategory) => {
			onSelectListing?.(listing);
		},
		[onSelectListing],
	);

	const handleLocate = useCallback(() => {
		if (!map || !position) return;

		if (isTracking) {
			cancelFly(flyRafRef);
			isTrackingRef.current = false;
			setIsTracking(false);
			return;
		}

		// Reset view orientation then fly to the user.
		map.setHeading(0);
		map.setTilt(45);
		justActivatedRef.current = true;
		isTrackingRef.current = true;
		setIsTracking(true);
		flyToPosition(map, position, flyRafRef);
	}, [map, position, isTracking]);

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
				variant={isTracking ? "default" : "secondary"}
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
				aria-label={isTracking ? "Stop following my location" : "Center on my location"}
			>
				<MyLocationRounded />
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

function cancelFly(ref: MutableRefObject<number | null>) {
	if (ref.current !== null) {
		cancelAnimationFrame(ref.current);
		ref.current = null;
	}
}

function flyToPosition(
	map: google.maps.Map,
	target: google.maps.LatLngLiteral,
	rafRef: MutableRefObject<number | null>,
) {
	cancelFly(rafRef);

	const startCenter = map.getCenter();
	const startZoom = map.getZoom() ?? 15;
	const targetZoom = Math.max(startZoom, 17);

	if (!startCenter) {
		map.setCenter(target);
		map.setZoom(targetZoom);
		return;
	}

	const startLat = startCenter.lat();
	const startLng = startCenter.lng();

	// Rough distance proxy — no trig needed at this scale.
	const isFar =
		Math.abs(target.lat - startLat) > 0.008 ||
		Math.abs(target.lng - startLng) > 0.008; // ~1 km

	const duration = isFar ? 750 : 420;
	// Dip zoom creates the "camera pulling back then swooping in" feel for far jumps.
	const dipZoom = isFar ? Math.max(2, Math.min(startZoom, targetZoom) - 2.5) : -1;

	const startTime = performance.now();
	// Cubic ease-in-out
	const ease = (t: number) =>
		t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

	const step = (now: number) => {
		const t = Math.min(1, (now - startTime) / duration);
		const e = ease(t);

		map.setCenter({
			lat: startLat + (target.lat - startLat) * e,
			lng: startLng + (target.lng - startLng) * e,
		});

		if (isFar) {
			// First half: ease out to dip zoom; second half: ease in to target zoom.
			const zoom =
				t < 0.5
					? startZoom + (dipZoom - startZoom) * ease(t * 2)
					: dipZoom + (targetZoom - dipZoom) * ease((t - 0.5) * 2);
			map.setZoom(zoom);
		} else if (startZoom < targetZoom) {
			map.setZoom(startZoom + (targetZoom - startZoom) * e);
		}

		if (t < 1) {
			rafRef.current = requestAnimationFrame(step);
		} else {
			rafRef.current = null;
			map.setCenter(target);
			map.setZoom(targetZoom);
		}
	};

	rafRef.current = requestAnimationFrame(step);
}

