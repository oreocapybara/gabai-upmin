"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bannerVariants = cva(
	"w-[min(92vw,360px)] rounded-2xl border px-3 py-2 shadow-lg text-m font-body backdrop-blur",
	{
		variants: {
			variant: {
				info: "bg-surface-info text-content-inverse-primary border-stroke-info",
				error:
					"bg-surface-negative text-content-inverse-primary border-stroke-negative",
				success:
					"bg-surface-positive text-content-inverse-primary border-stroke-success",
				warning:
					"bg-surface-notice text-content-inverse-primary border-stroke-notice",
			},
			size: {
				sm: "text-s",
				md: "text-m",
			},
		},
		defaultVariants: {
			variant: "info",
			size: "md",
		},
	},
);

export interface NotificationBannerProps
	extends
		React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof bannerVariants> {
	title?: string;
	isFloating?: boolean;
	autoHideMs?: number;
	onDismiss?: () => void;
	icon?: React.ReactNode;
	actionLabel?: string;
	onAction?: () => void;
	size?: "sm" | "md";
}

export function NotificationBanner({
	title,
	variant,
	className,
	isFloating = true,
	autoHideMs,
	onDismiss,
	icon,
	actionLabel,
	onAction,
	size,
	children,
	...props
}: NotificationBannerProps) {
	React.useEffect(() => {
		if (!autoHideMs || !onDismiss) return;
		const timeoutId = window.setTimeout(onDismiss, autoHideMs);
		return () => window.clearTimeout(timeoutId);
	}, [autoHideMs, onDismiss]);

	return (
		<div
			className={cn(
				bannerVariants({ variant, size }),
				isFloating && "fixed top-l right-l z-[2200]",
				className,
			)}
			role={variant === "error" ? "alert" : "status"}
			aria-live={variant === "error" ? "assertive" : "polite"}
			{...props}
		>
			<div className="flex items-start gap-3">
				{icon && (
					<div className="mt-0.5 text-content-inverse-primary">{icon}</div>
				)}
				<div className="flex-1">
					{title && (
						<div className="text-content-secondary font-body font-bold leading-tight">
							{title}
						</div>
					)}
					{children && (
						<div className="text-s text-content-inverse-primary leading-snug">
							{children}
						</div>
					)}
					{actionLabel && onAction && (
						<button
							type="button"
							onClick={onAction}
							className="mt-2 inline-flex items-center text-xs font-semibold uppercase tracking-widest text-content-inverse-primary/90 hover:text-content-inverse-primary"
						>
							{actionLabel}
						</button>
					)}
				</div>
				{onDismiss && (
					<button
						type="button"
						onClick={onDismiss}
						aria-label="Dismiss notification"
						className="-mt-0.5 text-content-inverse-primary/70 hover:text-content-inverse-primary"
					>
						×
					</button>
				)}
			</div>
		</div>
	);
}
