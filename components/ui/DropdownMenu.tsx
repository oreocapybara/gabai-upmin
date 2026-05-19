"use client";
import * as React from "react";
import ArrowDown from "@mui/icons-material/KeyboardArrowDownRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import type { CategoryOption } from "@/types";
import { getPinStyle } from "@/components/map/MapPin";
import { formatCategoryName } from "@/lib/utils";

export default function DropdownMenu({
	categories,
	onCategoryChange,
	menuPlacement = "bottom",
	defaultValue = "",
}: {
	categories: CategoryOption[];
	onCategoryChange?: (categoryId: string) => void;
	menuPlacement?: "top" | "bottom";
	defaultValue?: string;
}) {
	const [category, setCategory] = React.useState(defaultValue);
	const [open, setOpen] = React.useState(false);
	const ref = React.useRef<HTMLDivElement>(null);

	const selectedCategory = React.useMemo(
		() => categories.find((item) => String(item.category_id) === category),
		[categories, category],
	);

	React.useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleSelect = React.useCallback(
		(value: string) => {
			setCategory(value);
			setOpen(false);
			onCategoryChange?.(value);
		},
		[onCategoryChange],
	);

	const TriggerIcon = selectedCategory
		? getPinStyle(selectedCategory.category_name).Icon
		: null;

	return (
		<div ref={ref} className="relative min-w-56  font-body">
			{/* Trigger */}
			<button
				onClick={() => setOpen((prev) => !prev)}
				onPointerDown={(event) => event.stopPropagation()}
				className={`flex w-full h-full justify-between items-center gap-1.5 rounded-full border-2 px-4 py-1 transition-all duration-150 ${
					open
						? "border-content-brand shadow-sm"
						: "border-stroke hover:border-content-brand"
				} `}
			>
				<div className="flex flex-1 items-center gap-1.5">
					{TriggerIcon ? (
						<TriggerIcon
							fontSize="medium"
							className="shrink-0 align-middle text-content-brand"
						/>
					) : (
						<MenuRounded
							fontSize="medium"
							className="shrink-0 align-middle text-content-tertiary"
						/>
					)}
					<span
						className={`truncate text-left text-m font-normal leading-none${
							selectedCategory
								? "text-content-secondary"
								: "text-content-secondary"
						}`}
					>
						{selectedCategory
							? formatCategoryName(selectedCategory.category_name)
							: "Show All"}
					</span>
				</div>

				<span className="flex items-center">
					<ArrowDown
						className={`shrink-0 align-middle text-content-secondary transition-transform duration-300 ${
							open ? "rotate-180" : "rotate-0"
						}`}
					/>
				</span>
			</button>

			{/* Dropdown panel */}
			<div
				className={`absolute left-0 z-[1000] w-full origin-top rounded-2xl border-2 border-stroke-secondary bg-surface-primary py-2 shadow-lg font-body transition-all duration-200 ease-out ${
					menuPlacement === "top" ? "bottom-full mb-2" : "mt-2"
				} ${
					open
						? "scale-100 opacity-100"
						: "pointer-events-none scale-95 opacity-0"
				}`}
			>
				{/* Show All */}
				<DropdownItem
					isSelected={!category}
					onSelect={() => handleSelect("")}
					icon={
						<MenuRounded
							fontSize="medium"
							className={`shrink-0 ${!category ? "text-content-brand" : "text-content-tertiary"}`}
						/>
					}
					label="Show All"
				/>

				{/* Category items */}
				{categories.map((item) => {
					const { Icon } = getPinStyle(item.category_name);
					const isSelected = String(item.category_id) === category;

					return (
						<DropdownItem
							key={item.category_id}
							isSelected={isSelected}
							onSelect={() => handleSelect(String(item.category_id))}
							icon={
								<Icon
									fontSize="medium"
									className={`shrink-0 ${isSelected ? "text-content-brand" : "text-content-se"}`}
								/>
							}
							label={formatCategoryName(item.category_name)}
						/>
					);
				})}
			</div>
		</div>
	);
}

// ── Sub-components ──────────────────────────────────────────────────────────

function DropdownItem({
	isSelected,
	onSelect,
	icon,
	label,
}: {
	isSelected: boolean;
	onSelect: () => void;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<button
			onClick={onSelect}
			className={`mx-2 flex w-[calc(100%-16px)] items-center gap-1.5 rounded-xl px-2 py-1 transition-colors duration-100 ${
				isSelected
					? "bg-surface-selected text-content-brand active:bg-surface-selected"
					: "text-content-tertiary hover:bg-surface-selected active:bg-surface-selected"
			}`}
		>
			<div className="flex items-center gap-1.5">
				{icon}
				<span className="font-body text-m font-normal leading-none">
					{label}
				</span>
			</div>
		</button>
	);
}
