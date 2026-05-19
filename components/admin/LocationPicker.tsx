"use client";

import { useEffect, useRef, useState } from "react";
import { initGoogleMap } from "@/services/map/map.service";
import { importLibrary } from "@googlemaps/js-api-loader";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import TouchAppRoundedIcon from "@mui/icons-material/TouchAppRounded";

interface Coords {
	lat: number;
	lng: number;
}

interface LocationPickerProps {
	value: { lat: number | string; lng: number | string };
	onChange: (coords: Coords) => void;
}

function makePinElement(): HTMLElement {
	const el = document.createElement("div");
	el.style.cssText =
		"cursor: grab; display: flex; align-items: flex-end; justify-content: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));";
	el.innerHTML = `
		<svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M18 0C8.059 0 0 8.059 0 18C0 31.5 18 48 18 48C18 48 36 31.5 36 18C36 8.059 27.941 0 18 0Z" fill="#8a1538"/>
			<circle cx="18" cy="18" r="8" fill="white"/>
		</svg>
	`;
	return el;
}

function normalizeLatLng(pos: unknown): Coords {
	const p = pos as Record<string, unknown>;
	return {
		lat: typeof p.lat === "function" ? (p.lat as () => number)() : (p.lat as number),
		lng: typeof p.lng === "function" ? (p.lng as () => number)() : (p.lng as number),
	};
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	const initCoords: Coords | null =
		value.lat !== "" && value.lng !== ""
			? { lat: Number(value.lat), lng: Number(value.lng) }
			: null;

	const [pinPlaced, setPinPlaced] = useState(!!initCoords);
	const [displayCoords, setDisplayCoords] = useState<Coords | null>(initCoords);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		let cancelled = false;

		initGoogleMap(el).then(async (map) => {
			if (cancelled) return;

			const { AdvancedMarkerElement } = (await importLibrary(
				"marker",
			)) as google.maps.MarkerLibrary;
			if (cancelled) return;

			function placeOrMove(coords: Coords) {
				if (markerRef.current) {
					markerRef.current.position = coords;
				} else {
					const pin = makePinElement();
					const marker = new AdvancedMarkerElement({
						map,
						position: coords,
						content: pin,
						gmpDraggable: true,
					});
					markerRef.current = marker;

					// gmp-* are DOM CustomEvents — must use addEventListener, not addListener
					const markerEl = marker as unknown as EventTarget;

					markerEl.addEventListener("gmp-drag", () => {
						const pos = marker.position;
						if (!pos) return;
						setDisplayCoords(normalizeLatLng(pos));
					});

					markerEl.addEventListener("gmp-dragend", () => {
						const pos = marker.position;
						if (!pos) return;
						const updated = normalizeLatLng(pos);
						setDisplayCoords(updated);
						onChangeRef.current(updated);
					});
				}
			}

			// Pre-place pin for edit mode
			if (initCoords) {
				placeOrMove(initCoords);
				map.panTo(initCoords);
			}

			map.addListener("click", (e: google.maps.MapMouseEvent) => {
				if (!e.latLng) return;
				const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
				placeOrMove(coords);
				setPinPlaced(true);
				setDisplayCoords(coords);
				onChangeRef.current(coords);
			});
		});

		return () => {
			cancelled = true;
			if (markerRef.current) {
				markerRef.current.map = null;
				markerRef.current = null;
			}
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex flex-col gap-2">
			{/* Map */}
			<div
				className="relative overflow-hidden rounded-xl border border-stroke-secondary"
				style={{ height: 260 }}
			>
				<div ref={containerRef} className="h-full w-full" />

				{/* "Tap to place" hint — fades out once pin is placed */}
				<div
					className={[
						"pointer-events-none absolute inset-0 flex items-end justify-center pb-4",
						"transition-opacity duration-300",
						pinPlaced ? "opacity-0" : "opacity-100",
					].join(" ")}
				>
					<div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
						<TouchAppRoundedIcon style={{ fontSize: 16 }} />
						<span className="text-xs font-medium">Tap the map to place a pin</span>
					</div>
				</div>
			</div>

			{/* Coordinate readout */}
			<div className="flex items-center gap-2 rounded-lg border border-stroke-secondary bg-surface-secondary px-3 py-2.5 min-h-[40px]">
				<LocationOnRoundedIcon
					style={{ fontSize: 16 }}
					className={displayCoords ? "text-content-brand shrink-0" : "text-content-tertiary shrink-0"}
				/>
				{displayCoords ? (
					<>
						<span className="font-mono text-xs text-content-secondary">
							{displayCoords.lat.toFixed(6)},&nbsp;{displayCoords.lng.toFixed(6)}
						</span>
						<span className="ml-auto text-xs text-content-tertiary whitespace-nowrap">
							Click on the map to adjust
						</span>
					</>
				) : (
					<span className="text-xs text-content-tertiary">No location set</span>
				)}
			</div>
		</div>
	);
}
