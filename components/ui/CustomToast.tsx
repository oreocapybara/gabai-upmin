"use client";

import React from "react";
import { toast } from "sonner";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// ─── Config ───────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "warning" | "info";

const VARIANT = {
	success: {
		Icon: CheckCircleRoundedIcon,
		iconClass: "text-content-positive",
		accentClass: "bg-content-positive",
	},
	error: {
		Icon: CancelRoundedIcon,
		iconClass: "text-content-negative",
		accentClass: "bg-content-negative",
	},
	warning: {
		Icon: WarningAmberRoundedIcon,
		iconClass: "text-content-notice",
		accentClass: "bg-content-notice",
	},
	info: {
		Icon: InfoRoundedIcon,
		iconClass: "text-content-brand",
		accentClass: "bg-surface-brand",
	},
} satisfies Record<ToastVariant, { Icon: React.ElementType; iconClass: string; accentClass: string }>;

// ─── Toast content ────────────────────────────────────────────────────────────

function ToastContent({
	id,
	variant,
	title,
	description,
}: {
	id: string | number;
	variant: ToastVariant;
	title: string;
	description?: string;
}) {
	const { Icon, iconClass, accentClass } = VARIANT[variant];

	return (
		<div className="flex w-full overflow-hidden rounded-2xl border border-stroke-secondary bg-surface-primary shadow-lg">
			{/* Left accent bar */}
			<div className={`w-1 shrink-0 ${accentClass}`} />

			{/* Content */}
			<div className="flex flex-1 items-start gap-3 px-4 py-3">
				<span className={`mt-0.5 shrink-0 ${iconClass}`}>
					<Icon fontSize="small" />
				</span>

				<div className="flex min-w-0 flex-1 flex-col">
					<p className="text-sm font-semibold leading-snug text-content-primary">
						{title}
					</p>
					{description && (
						<p className="mt-0.5 text-xs leading-snug text-content-secondary">
							{description}
						</p>
					)}
				</div>

				<button
					type="button"
					onClick={() => toast.dismiss(id)}
					aria-label="Dismiss"
					className="mt-0.5 shrink-0 text-content-tertiary transition-colors hover:text-content-secondary"
				>
					<CloseRoundedIcon sx={{ fontSize: 16 }} />
				</button>
			</div>
		</div>
	);
}

// ─── API ──────────────────────────────────────────────────────────────────────

const DURATION: Record<ToastVariant, number> = {
	success: 4000,
	error: 6000,
	warning: 4000,
	info: 4000,
};

function make(variant: ToastVariant) {
	return (title: string, description?: string) => {
		toast.custom(
			(id) => (
				<ToastContent
					id={id}
					variant={variant}
					title={title}
					description={description}
				/>
			),
			{ duration: DURATION[variant] },
		);
	};
}

export const showToast = {
	success: make("success"),
	error:   make("error"),
	warning: make("warning"),
	info:    make("info"),
};
