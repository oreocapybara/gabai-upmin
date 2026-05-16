"use client";

import { Button } from "@/components/ui/Button";
import Warning from "@mui/icons-material/WarningAmberRounded";

interface DeleteConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	listingName: string;
	isLoading?: boolean;
}

export default function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	listingName,
	isLoading = false,
}: DeleteConfirmModalProps) {

	// Always in DOM — CSS transitions on isOpen avoid the useEffect-delay flicker.
	return (
		<div
			className={[
				"fixed inset-0 z-50 flex items-center justify-center p-4",
				"transition-opacity duration-200 ease-out",
				isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
			].join(" ")}
			style={{ backgroundColor: "var(--color-black-56)" }}
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div
				className={[
					"bg-surface-primary rounded-2xl p-6 w-full max-w-[350px] shadow-xl border border-stroke-secondary",
					"transition-all duration-200 ease-out",
					isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
				].join(" ")}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Icon + title */}
				<div className="flex flex-col items-center gap-2 mb-4">
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-notice-subtle">
						<Warning className="text-content-notice !text-[24px]" />
					</div>
					<h2 className="text-base font-semibold text-content-primary text-center">
						Delete listing?
					</h2>
					<p className="text-sm text-content-secondary text-center">
						This will permanently remove{" "}
						<span className="font-medium text-content-primary">{listingName}</span>{" "}
						from the database. This action cannot be undone.
					</p>
				</div>

				{/* Buttons */}
				<div className="flex gap-3">
					<Button
						variant="secondary"
						onClick={onClose}
						disabled={isLoading}
						className="flex-1"
					>
						Cancel
					</Button>
					<Button
						variant="default"
						onClick={onConfirm}
						disabled={isLoading}
						className="flex-1 bg-surface-negative hover:bg-content-negative-bold active:bg-content-negative-bold text-content-inverse-primary"
					>
						{isLoading ? "Deleting…" : "Delete"}
					</Button>
				</div>
			</div>
		</div>
	);
}
