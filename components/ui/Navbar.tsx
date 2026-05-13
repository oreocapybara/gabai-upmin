"use client";

import Image from "next/image";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import { useAdminCheck } from "@/hooks/common/useAdminCheck";
import { useLogoPress } from "@/hooks/common/useLogoPress";
import { useNavSearch } from "@/hooks/common/useNavSearch";
import { SearchInput } from "@/components/ui/SearchInput";

export default function Navbar() {
	const isAdmin = useAdminCheck();
	const { startPress, endPress } = useLogoPress();
	const search = useNavSearch();

	return (
		<nav className="fixed top-0 left-0 w-full h-16 bg-surface-brand z-[9999] flex items-center px-4">
			<div className="w-full max-w-4xl mx-auto flex items-center justify-between">
				{/* Logo — long-press navigates to /login */}
				<div
					className="cursor-pointer active:scale-95 transition-transform"
					onMouseDown={startPress}
					onMouseUp={endPress}
					onMouseLeave={endPress}
					onTouchStart={startPress}
					onTouchEnd={endPress}
				>
					<div className="relative h-10 w-10 overflow-hidden rounded-full bg-brand-700">
						<Image
							src="/logo.svg"
							alt="Logo"
							fill
							priority
							className="object-contain p-1"
						/>
					</div>
				</div>

				{/* Right side */}
				<div className="flex items-center gap-2 ml-4">
					<SearchInput
						value={search.searchValue}
						showSuggestions={search.showSuggestions}
						suggestions={search.suggestions}
						onChange={search.handleSearchChange}
						onSubmit={search.handleSearchSubmit}
						onSuggestionSelect={search.handleSuggestionSelect}
						onKeyDown={search.handleKeyDown}
						onFocus={search.handleFocus}
						onBlur={search.handleBlur}
					/>

					{isAdmin && (
						<button
							type="button"
							title="Customize Dashboard"
							className="flex items-center justify-center p-2 rounded-full text-gray-100 hover:bg-gray-100 hover:text-brand-700 transition-all shrink-0"
						>
							<DashboardCustomizeOutlinedIcon sx={{ fontSize: 22 }} />
						</button>
					)}
				</div>
			</div>
		</nav>
	);
}
