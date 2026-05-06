"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bannerVariants = cva(
	"rounded-xl border px-2 py-1 shadow-lg text-m font-body",
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
		},
		defaultVariants: {
			variant: "info",
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
}

export function NotificationBanner({
	title,
	variant,
	className,
	isFloating = true,
	autoHideMs,
	onDismiss,
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
				bannerVariants({ variant }),
				isFloating && "fixed top-l right-l z-50",
				className,
			)}
			role="status"
			aria-live="polite"
			{...props}
		>
			{title && <div className="font-body font-bold">{title}</div>}
			{children && (
				<div className="text-s text-content-inverse-primary">{children}</div>
			)}
		</div>
	);
}
