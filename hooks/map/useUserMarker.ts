import { useEffect, useRef } from "react";
import {
	createAdvancedMarker,
	removeMarker,
} from "@/services/map/mapMarker.service";

export type UserMarkerParams = {
	map: google.maps.Map | null;
	position: {
		lat: number;
		lng: number;
		heading: number | null;
		accuracy: number | null;
	} | null;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

function injectStyles() {
	if (document.getElementById("user-marker-styles")) return;
	const style = document.createElement("style");
	style.id = "user-marker-styles";
	style.textContent = `
		@keyframes userMarkerPulse {
			0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
			75%  { transform: translate(-50%, -50%) scale(3.2); opacity: 0;   }
			100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0;   }
		}
		.user-marker-pulse {
			animation: userMarkerPulse 2.4s ease-out infinite;
		}
		.user-cone-group {
			transform-origin: 32px 32px;
			transition: transform 0.35s ease-out;
		}
	`;
	document.head.appendChild(style);
}

// ─── Marker DOM builder ───────────────────────────────────────────────────────

function buildMarkerElement(): {
	wrapper: HTMLDivElement;
	coneGroup: SVGGElement;
	svg: SVGSVGElement;
} {
	// ── Wrapper — 0×0 with overflow:visible ──────────────────────────────────
	const wrapper = document.createElement("div");
	Object.assign(wrapper.style, {
		position: "relative",
		width: "0",
		height: "0",
		overflow: "visible",
	});

	// ── Direction cone SVG ────────────────────────────────────────────────────
	// The SVG element itself has NO CSS transform — only static positioning.
	// Rotation lives on the inner <g> so Google Maps can never accidentally
	// trigger the heading transition by repositioning the marker container.
	const ns = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
	svg.setAttribute("width", "64");
	svg.setAttribute("height", "64");
	svg.setAttribute("viewBox", "0 0 64 64");
	Object.assign(svg.style, {
		position: "absolute",
		left: "-32px",
		top: "-32px",
		overflow: "visible",
		pointerEvents: "none",
		// NO transform / transition here — purely positional.
	});

	// Radial gradient centred on the dot at SVG (32,32).
	const defs = document.createElementNS(ns, "defs");
	const grad = document.createElementNS(ns, "radialGradient");
	grad.setAttribute("id", "userConeGrad");
	grad.setAttribute("cx", "32");
	grad.setAttribute("cy", "32");
	grad.setAttribute("r", "32");
	grad.setAttribute("gradientUnits", "userSpaceOnUse");

	const s1 = document.createElementNS(ns, "stop");
	s1.setAttribute("offset", "0%");
	s1.setAttribute("stop-color", "var(--background-info)");
	s1.setAttribute("stop-opacity", "0.75");

	const s2 = document.createElementNS(ns, "stop");
	s2.setAttribute("offset", "100%");
	s2.setAttribute("stop-color", "var(--background-info)");
	s2.setAttribute("stop-opacity", "0");

	grad.appendChild(s1);
	grad.appendChild(s2);
	defs.appendChild(grad);
	svg.appendChild(defs);

	// <g> carries the rotation. transform-origin and transition are in the
	// injected stylesheet (.user-cone-group) so they're in SVG coordinate space.
	const g = document.createElementNS(ns, "g") as SVGGElement;
	g.setAttribute("class", "user-cone-group");
	// Hidden by default — shown when heading is available.
	g.style.opacity = "0";

	// Cone: apex at (32,32), ~50° fan pointing up.
	const path = document.createElementNS(ns, "path");
	path.setAttribute("d", "M 32 32 L 19 4 L 45 4 Z");
	path.setAttribute("fill", "url(#userConeGrad)");
	g.appendChild(path);
	svg.appendChild(g);

	// ── Pulse ring — centered on anchor (0,0) ────────────────────────────────
	// left/top stay at 0 so the keyframe translate(-50%,-50%) is the sole
	// centering mechanism and doesn't double-shift.
	const pulse = document.createElement("div");
	pulse.className = "user-marker-pulse";
	Object.assign(pulse.style, {
		position: "absolute",
		left: "0",
		top: "0",
		width: "20px",
		height: "20px",
		borderRadius: "50%",
		background: "var(--background-info)",
		pointerEvents: "none",
	});

	// ── Core dot — centered on anchor (0,0) ──────────────────────────────────
	// box-sizing: border-box ensures the layout box is exactly 20×20 so the
	// dot center lands at (0,0) and aligns with the pulse ring's center.
	// Without it (content-box default) the 14px box + 3px border shifts the
	// layout center to (-3,-3) and the pulse radiates from the wrong point.
	const dot = document.createElement("div");
	Object.assign(dot.style, {
		position: "absolute",
		left: "-10px",
		top: "-10px",
		width: "20px",
		height: "20px",
		boxSizing: "border-box",
		borderRadius: "50%",
		background: "var(--background-info)",
		border: "3px solid rgb(var(--color-white))",
		boxShadow: "0 2px 10px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)",
		zIndex: "1",
	});

	wrapper.appendChild(svg);
	wrapper.appendChild(pulse);
	wrapper.appendChild(dot);

	return { wrapper, coneGroup: g, svg };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserMarker({ map, position }: UserMarkerParams) {
	const markerRef =
		useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
	const coneGroupRef = useRef<SVGGElement | null>(null);

	// Create the marker once when map + initial position are both ready.
	useEffect(() => {
		if (!map || !position || markerRef.current) return;

		injectStyles();
		let isCancelled = false;

		const { wrapper, coneGroup } = buildMarkerElement();
		coneGroupRef.current = coneGroup;

		// Apply initial heading without triggering the CSS transition.
		if (position.heading != null) {
			coneGroup.style.transition = "none";
			coneGroup.style.opacity = "1";
			coneGroup.style.transform = `rotate(${position.heading}deg)`;
			// Re-enable transition on next frame so subsequent updates animate.
			requestAnimationFrame(() => {
				coneGroup.style.transition = "";
			});
		}

		createAdvancedMarker(map, position, "Your Location", wrapper).then(
			(marker) => {
				if (isCancelled) {
					removeMarker(marker);
					return;
				}
				markerRef.current = marker;
			},
		);

		return () => {
			isCancelled = true;
			if (markerRef.current) {
				removeMarker(markerRef.current);
				markerRef.current = null;
			}
			coneGroupRef.current = null;
		};
	}, [map, position]);

	// Update position + heading on every subsequent position change.
	useEffect(() => {
		if (!markerRef.current) return;

		if (!position) {
			removeMarker(markerRef.current);
			markerRef.current = null;
			return;
		}

		markerRef.current.position = { lat: position.lat, lng: position.lng };

		if (coneGroupRef.current) {
			if (position.heading == null) {
				coneGroupRef.current.style.opacity = "0";
			} else {
				coneGroupRef.current.style.opacity = "1";
				coneGroupRef.current.style.transform = `rotate(${position.heading}deg)`;
			}
		}
	}, [position]);
}
