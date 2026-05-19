"use client";

import { cn } from "@/lib/utils";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { NotificationState } from "@/hooks/common/useNotification";

interface AdminNotificationBarProps {
	notification: NotificationState | null;
	visible: boolean;
	onDismiss: () => void;
	/** "inline" sits in document flow (dashboard). "fixed" pins to top-0 (form pages). */
	mode?: "inline" | "fixed";
}

export function AdminNotificationBar({
	notification,
	visible,
	onDismiss,
	mode = "inline",
}: AdminNotificationBarProps) {
	const isSuccess = notification?.variant === "success";

	const colors = isSuccess
		? "bg-surface-positive border-stroke-success"
		: "bg-surface-negative border-stroke-negative";

	const innerContent = notification ? (
		<>
			{isSuccess ? (
				<CheckCircleRoundedIcon className="text-content-inverse-primary shrink-0 !text-[18px]" />
			) : (
				<ErrorRoundedIcon className="text-content-inverse-primary shrink-0 !text-[18px]" />
			)}
			<p className="flex-1 min-w-0 text-sm font-medium text-content-inverse-primary">
				{notification.message}
			</p>
			<button
				onClick={onDismiss}
				aria-label="Dismiss"
				className="shrink-0 text-content-inverse-primary hover:text-content-inverse-secondary transition-colors"
			>
				<CloseRoundedIcon className="!text-[16px]" />
			</button>
		</>
	) : null;

	if (mode === "fixed") {
		return (
			<div
				className={cn(
					"fixed inset-x-0 top-0 z-[10000] border-b",
					"transition-[opacity,transform] duration-300 ease-out",
					visible && notification
						? "opacity-100 translate-y-0"
						: "opacity-0 -translate-y-full pointer-events-none",
					colors,
				)}
			>
				<div className="mx-auto flex max-w-xl items-start gap-3 px-4 py-3">
					{innerContent}
				</div>
			</div>
		);
	}

	// Inline mode: height-animating wrapper + opacity/translate on inner content
	return (
		<div
			className={cn(
				"flex-none overflow-hidden",
				"transition-[max-height] duration-300 ease-out",
				notification ? "max-h-24" : "max-h-0",
			)}
		>
			<div
				className={cn(
					"flex items-start gap-3 px-4 py-2.5 border-b",
					"transition-[opacity,transform] duration-300 ease-out",
					visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
					colors,
				)}
			>
				{innerContent}
			</div>
		</div>
	);
}
