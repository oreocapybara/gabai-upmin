"use client";

import React, { useEffect, useRef, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";

const OUTPUT_SIZE = 1080;

function constrainOffset(
	off: { x: number; y: number },
	us: number,
	cs: number,
	nat: { w: number; h: number },
) {
	if (!nat.w || !nat.h || !cs) return off;
	const fs = Math.max(cs / nat.w, cs / nat.h);
	const dW = nat.w * fs * us;
	const dH = nat.h * fs * us;
	const maxX = Math.max(0, (dW - cs) / 2);
	const maxY = Math.max(0, (dH - cs) / 2);
	return {
		x: Math.max(-maxX, Math.min(maxX, off.x)),
		y: Math.max(-maxY, Math.min(maxY, off.y)),
	};
}

interface ImageCropModalProps {
	src: string;
	fileName: string;
	onConfirm: (blob: Blob, fileName: string) => void;
	onCancel: () => void;
}

export function ImageCropModal({ src, fileName, onConfirm, onCancel }: ImageCropModalProps) {
	const imgRef = useRef<HTMLImageElement>(null);
	const cropRef = useRef<HTMLDivElement>(null);
	const cropSizeRef = useRef(300);
	const naturalRef = useRef({ w: 0, h: 0 });

	const [cropSize, setCropSize] = useState(300);
	const [natural, setNatural] = useState({ w: 0, h: 0 });
	const [userScale, setUserScale] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });

	const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
	const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);

	// Keep refs in sync so the non-passive wheel handler closure sees current values
	useEffect(() => { cropSizeRef.current = cropSize; }, [cropSize]);
	useEffect(() => { naturalRef.current = natural; }, [natural]);

	// Measure the crop viewport after mount
	useEffect(() => {
		const el = cropRef.current;
		if (!el) return;
		const size = el.offsetWidth;
		setCropSize(size);
		cropSizeRef.current = size;
	}, []);

	// Wheel needs a non-passive listener so e.preventDefault() actually works
	useEffect(() => {
		const el = cropRef.current;
		if (!el) return;
		const handler = (e: WheelEvent) => {
			e.preventDefault();
			setUserScale((prev) => {
				const next = Math.min(5, Math.max(1, prev * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
				setOffset((o) => constrainOffset(o, next, cropSizeRef.current, naturalRef.current));
				return next;
			});
		};
		el.addEventListener("wheel", handler, { passive: false });
		return () => el.removeEventListener("wheel", handler);
	}, []);

	const fitScale =
		natural.w && natural.h && cropSize
			? Math.max(cropSize / natural.w, cropSize / natural.h)
			: 1;
	const totalScale = fitScale * userScale;

	const handleImageLoad = () => {
		const img = imgRef.current;
		if (!img) return;
		const nat = { w: img.naturalWidth, h: img.naturalHeight };
		setNatural(nat);
		naturalRef.current = nat;
	};

	// Mouse / stylus via pointer events (touch is handled separately)
	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.pointerType === "touch") return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!dragRef.current || e.pointerType === "touch") return;
		setOffset(
			constrainOffset(
				{ x: dragRef.current.ox + e.clientX - dragRef.current.sx, y: dragRef.current.oy + e.clientY - dragRef.current.sy },
				userScale,
				cropSize,
				natural,
			),
		);
	};

	const onPointerUp = () => { dragRef.current = null; };

	// Touch: single-finger drag + two-finger pinch
	const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		if (e.touches.length === 1) {
			const t = e.touches[0];
			dragRef.current = { sx: t.clientX, sy: t.clientY, ox: offset.x, oy: offset.y };
			pinchRef.current = null;
		} else if (e.touches.length === 2) {
			dragRef.current = null;
			const dx = e.touches[0].clientX - e.touches[1].clientX;
			const dy = e.touches[0].clientY - e.touches[1].clientY;
			pinchRef.current = { startDist: Math.hypot(dx, dy), startScale: userScale };
		}
	};

	const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (e.touches.length === 1 && dragRef.current) {
			const t = e.touches[0];
			setOffset(
				constrainOffset(
					{ x: dragRef.current.ox + t.clientX - dragRef.current.sx, y: dragRef.current.oy + t.clientY - dragRef.current.sy },
					userScale,
					cropSize,
					natural,
				),
			);
		} else if (e.touches.length === 2 && pinchRef.current) {
			const dx = e.touches[0].clientX - e.touches[1].clientX;
			const dy = e.touches[0].clientY - e.touches[1].clientY;
			const next = Math.min(5, Math.max(1, pinchRef.current.startScale * (Math.hypot(dx, dy) / pinchRef.current.startDist)));
			setUserScale(next);
			setOffset((o) => constrainOffset(o, next, cropSize, natural));
		}
	};

	const onTouchEnd = () => {
		dragRef.current = null;
		pinchRef.current = null;
	};

	const zoomBy = (factor: number) => {
		setUserScale((prev) => {
			const next = Math.min(5, Math.max(1, prev * factor));
			setOffset((o) => constrainOffset(o, next, cropSizeRef.current, naturalRef.current));
			return next;
		});
	};

	const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const ratio = (e.clientX - rect.left) / rect.width;
		const next = Math.min(5, Math.max(1, 1 + ratio * 4));
		setUserScale(next);
		setOffset((o) => constrainOffset(o, next, cropSizeRef.current, naturalRef.current));
	};

	const handleConfirm = () => {
		const img = imgRef.current;
		if (!img || !natural.w || !cropSize) return;
		const canvas = document.createElement("canvas");
		canvas.width = OUTPUT_SIZE;
		canvas.height = OUTPUT_SIZE;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const srcW = cropSize / totalScale;
		const srcH = cropSize / totalScale;
		const srcX = natural.w / 2 - offset.x / totalScale - srcW / 2;
		const srcY = natural.h / 2 - offset.y / totalScale - srcH / 2;
		ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
		canvas.toBlob((blob) => { if (blob) onConfirm(blob, fileName); }, "image/jpeg", 0.92);
	};

	return (
		<div className="fixed inset-0 z-[9999] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Crop photo">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
					aria-label="Cancel"
				>
					<CloseRoundedIcon />
				</button>
				<span className="text-sm font-semibold text-white">Crop photo</span>
				<button
					type="button"
					onClick={handleConfirm}
					disabled={natural.w === 0}
					className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400 active:bg-sky-600 disabled:opacity-40"
				>
					Use
				</button>
			</div>

			{/* Main */}
			<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-4">
				<p className="text-xs tracking-wide text-white/40">Drag to reposition · Pinch or scroll to zoom</p>

				{/* Crop viewport */}
				<div
					ref={cropRef}
					className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-2xl ring-1 ring-white/10"
					style={{ cursor: "grab", touchAction: "none", userSelect: "none" } as React.CSSProperties}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
					onTouchStart={onTouchStart}
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						ref={imgRef}
						src={src}
						alt=""
						onLoad={handleImageLoad}
						draggable={false}
						className="absolute max-w-none select-none pointer-events-none"
						style={
							natural.w > 0 && cropSize > 0
								? {
										width: natural.w * totalScale,
										height: natural.h * totalScale,
										left: "50%",
										top: "50%",
										transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
									}
								: { display: "none" }
						}
					/>

					{/* Rule-of-thirds grid */}
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute inset-x-0 border-t border-white/20" style={{ top: "33.33%" }} />
						<div className="absolute inset-x-0 border-t border-white/20" style={{ top: "66.66%" }} />
						<div className="absolute inset-y-0 border-l border-white/20" style={{ left: "33.33%" }} />
						<div className="absolute inset-y-0 border-l border-white/20" style={{ left: "66.66%" }} />
					</div>

					{/* Loading spinner */}
					{natural.w === 0 && (
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
						</div>
					)}
				</div>

				{/* Zoom controls */}
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => zoomBy(1 / 1.25)}
						className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:bg-white/30"
						aria-label="Zoom out"
					>
						<ZoomOutRoundedIcon fontSize="small" />
					</button>

					{/* Slider track */}
					<div
						className="relative h-1 w-36 cursor-pointer rounded-full bg-white/20"
						onClick={handleSliderClick}
					>
						<div
							className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-white"
							style={{ width: `${((userScale - 1) / 4) * 100}%` }}
						/>
						<div
							className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-md"
							style={{ left: `calc(${((userScale - 1) / 4) * 100}% - 7px)` }}
						/>
					</div>

					<button
						type="button"
						onClick={() => zoomBy(1.25)}
						className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:bg-white/30"
						aria-label="Zoom in"
					>
						<ZoomInRoundedIcon fontSize="small" />
					</button>
				</div>
			</div>
		</div>
	);
}
