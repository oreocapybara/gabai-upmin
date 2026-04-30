import * as React from "react";
import { cn } from "@/lib/utils";

type InputState = "default" | "success" | "error" | "warning";

type InputProps = React.ComponentProps<"input"> & {
	state?: InputState;
	leading?: React.ReactNode;
	trailing?: React.ReactNode;
	helpText?: string;
	label?: string;
	id?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			state = "default",
			label,
			id,
			leading,
			trailing,
			helpText,
			...props
		},
		ref,
	) => {
		const stateStyles = {
			default:
				"border-stroke-secondary focus-within:border-stroke-primary focus-within:ring-1 focus-within:ring-stroke-primary",
			success:
				"border-stroke-positive focus-within:ring-stroke-positive focus-within:ring-1 focus-within:ring-stroke-positive",
			error:
				"border-stroke-negative focus-within:border-stroke-negative focus-within:ring-1 focus-within:ring-stroke-negative",
			warning:
				"border-stroke-notice focus-within:border-stroke-notice focus-within:ring-1 focus-within:ring-stroke-notice",
		};

		const helpStyles = {
			default: "text-content-tertiary",
			success: "text-content-positive",
			error: "text-content-negative",
			warning: "text-content-notice",
		};

		const iconStyles = {
			default: "text-content-tertiary",
			success: "text-content-positive-bold",
			error: "text-content-negative-bold",
			warning: "text-content-notice-bold",
		};

		const generatedId = React.useId();
		const inputId = id ?? generatedId;

		return (
			// Input + Helptext Wrapper
			<div className={cn("flex flex-col relative w-full min-w-0 sm:min-w-80")}>
				{/* Input Wrapper */}
				<div
					className={cn(
						"flex justify-between self-stretch border gap-2 rounded-lg px-4 py-3 caret-stroke-brand",
						stateStyles[state],
						"transition-all duration-200 ease-out",
					)}
				>
					{label ? (
						<label
							className={cn(
								"absolute -top-2 left-3.5 bg-surface-primary px-1 text-xs text-content-secondary ",
							)}
							htmlFor={inputId}
						>
							{label}
						</label>
					) : null}

					{/* Content Wrapper */}
					<div className={cn("flex flex-1 min-w-0 items-center gap-2")}>
						{leading ? (
							<span
								className={cn(
									"flex h-6 w-6 items-center justify-center",
									iconStyles[state],
								)}
							>
								{leading}
							</span>
						) : null}

						<input
							id={inputId}
							ref={ref}
							{...props}
							className={cn(
								"flex-1 min-w-0 bg-transparent text-content-primary text-m outline-none placeholder:text-content-tertiary",
								className,
							)}
						/>
					</div>

					{trailing ? (
						<span
							className={cn(
								"flex h-6 w-6 items-center justify-center",
								iconStyles[state],
							)}
						>
							{trailing}
						</span>
					) : null}
				</div>

				{helpText ? (
					<p
						className={cn(
							"text-xs mt-1.5 ml-4",
							helpStyles[state],
							"transition-all",
						)}
					>
						{helpText}
					</p>
				) : null}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
