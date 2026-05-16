import { useCallback, useEffect, useRef, useState } from "react";

export type SnapPoint = 0 | 30 | 60 | 90;

const DEFAULT_SNAP_POINTS: SnapPoint[] = [0, 30, 60, 90];
export const DRAWER_SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";
export const DRAWER_SNAP_DURATION_MS = 320;

interface UseDraggableDrawerOptions {
	onSnapZero: () => void;
	pullerHeight: number;
	snapPoints?: SnapPoint[];
	dragThresholdPx?: number;
}

export function useDraggableDrawer({
	onSnapZero,
	pullerHeight,
	snapPoints = DEFAULT_SNAP_POINTS,
	dragThresholdPx = 24,
}: UseDraggableDrawerOptions) {
	const paperRef = useRef<HTMLDivElement | null>(null);
	const snapRef = useRef<SnapPoint>(0);
	const [snapState, setSnapState] = useState<SnapPoint>(0);

	const dragging = useRef(false);
	const [isDragging, setIsDragging] = useState(false);
	const activePointerId = useRef<number | null>(null);
	const startY = useRef(0);
	const startHeightPx = useRef(0);

	const maxSnap = snapPoints[snapPoints.length - 1] ?? 75;

	const resolvePaper = useCallback(() => {
		if (!paperRef.current) {
			paperRef.current = document.querySelector(
				".MuiDrawer-paper",
			) as HTMLDivElement | null;
		}
		return paperRef.current;
	}, []);

	const snapToPx = useCallback(
		(point: SnapPoint) => {
			if (point === 0) return 0;
			return (point / 100) * window.innerHeight - pullerHeight;
		},
		[pullerHeight],
	);

	const snapNearest = useCallback(
		(targetPx: number) => {
			const vh = window.innerHeight;
			const targetPct = (targetPx / vh) * 100;
			return snapPoints.reduce((closest, point) =>
				Math.abs(point - targetPct) < Math.abs(closest - targetPct)
					? point
					: closest,
			) as SnapPoint;
		},
		[snapPoints],
	);

	const setHeight = useCallback(
		(px: number, animated: boolean) => {
			const el = resolvePaper();
			if (!el) return;
			el.style.transition = animated
				? `height ${DRAWER_SNAP_DURATION_MS}ms ${DRAWER_SPRING}`
				: "none";
			el.style.height = `${Math.max(0, px)}px`;
		},
		[resolvePaper],
	);

	const commitSnap = useCallback(
		(point: SnapPoint) => {
			snapRef.current = point;
			setSnapState(point);
			setHeight(snapToPx(point), true);
			if (point === 0) onSnapZero();
		},
		[setHeight, onSnapZero, snapToPx],
	);

	useEffect(() => {
		const handleGlobalPointerUp = (e: PointerEvent) => {
			if (!dragging.current) return;
			if (
				activePointerId.current !== null &&
				e.pointerId !== activePointerId.current
			) {
				return;
			}

			dragging.current = false;
			setIsDragging(false);
			activePointerId.current = null;
			const currentH =
				resolvePaper()?.offsetHeight ?? snapToPx(snapRef.current);
			commitSnap(snapNearest(currentH));
		};

		window.addEventListener("pointerup", handleGlobalPointerUp);
		window.addEventListener("pointercancel", handleGlobalPointerUp);
		return () => {
			window.removeEventListener("pointerup", handleGlobalPointerUp);
			window.removeEventListener("pointercancel", handleGlobalPointerUp);
		};
	}, [commitSnap, resolvePaper, snapNearest, snapToPx]);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			// Only drag from the handle zone — not from interactive children.
			// The interactive row uses stopPropagation, but this is a second
			// guard: only capture if the target is the puller itself or the pill.
			const target = e.target as HTMLElement;
			const isPullerRoot = target === e.currentTarget;
			const isPill =
				target.dataset.dragHandle !== undefined ||
				target.closest("[data-drag-handle]");

			if (!isPullerRoot && !isPill) return;

			e.currentTarget.setPointerCapture(e.pointerId);
			activePointerId.current = e.pointerId;
			dragging.current = true;
			setIsDragging(true);
			startY.current = e.clientY;
			startHeightPx.current =
				resolvePaper()?.offsetHeight ?? snapToPx(snapRef.current);
			const el = resolvePaper();
			if (el) el.style.transition = "none";
		},
		[resolvePaper, snapToPx],
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!dragging.current) return;
			const deltaY = startY.current - e.clientY;
			const maxHeightPx = snapToPx(maxSnap);
			const newH = Math.max(
				0,
				Math.min(startHeightPx.current + deltaY, maxHeightPx),
			);
			setHeight(newH, false);
		},
		[setHeight, snapToPx, maxSnap],
	);

	const onPointerUp = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!dragging.current) return;
			dragging.current = false;
			setIsDragging(false);
			activePointerId.current = null;
			try {
				e.currentTarget.releasePointerCapture(e.pointerId);
			} catch {
				// Ignore if pointer capture is already released.
			}
			const deltaY = startY.current - e.clientY;
			if (Math.abs(deltaY) < dragThresholdPx) {
				setHeight(snapToPx(snapRef.current), true);
				return;
			}
			const currentH = startHeightPx.current + deltaY;
			commitSnap(snapNearest(currentH));
		},
		[commitSnap, dragThresholdPx, setHeight, snapNearest, snapToPx],
	);

	const snapTo = useCallback(
		(point: SnapPoint) => {
			commitSnap(point);
		},
		[commitSnap],
	);

	return {
		snapState,
		isDragging,
		snapTo,
		snapToPx,
		onPointerDown,
		onPointerMove,
		onPointerUp,
	};
}
