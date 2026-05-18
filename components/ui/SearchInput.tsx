"use client";

import Search from '@mui/icons-material/SearchRounded';

type ListingOption = {
	listing_id: string | number;
	listing_name: string;
};

interface SearchInputProps {
	value: string;
	showSuggestions: boolean;
	suggestions: ListingOption[];
	onChange: (value: string) => void;
	onSubmit: () => void;
	onSuggestionSelect: (value: string) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onFocus: () => void;
	onBlur: () => void;
}

export function SearchInput({
	value,
	showSuggestions,
	suggestions,
	onChange,
	onSubmit,
	onSuggestionSelect,
	onKeyDown,
	onFocus,
	onBlur,
}: SearchInputProps) {
	return (
		<div className="relative w-full max-w-xs">
			<input
				type="text"
				placeholder="Search..."
				aria-label="Search listings"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				onFocus={onFocus}
				onBlur={onBlur}
				className="block w-full pl-3 pr-10 py-1 border border-transparent rounded-full bg-surface-primary text-sm focus:outline-none focus:ring-2 focus:ring-surface-brand-hover transition-all"
			/>

			<button
				type="button"
				onClick={onSubmit}
				aria-label="Submit search"
				className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-700 focus:text-brand-700 transition-colors"
			>
				<Search/>
			</button>

			{showSuggestions && suggestions.length > 0 && (
				<ul
					role="listbox"
					className="absolute z-[10000] mt-2 w-full rounded-2xl border border-stroke-secondary bg-surface-primary shadow-lg overflow-hidden"
				>
					{suggestions.map((listing) => (
						<li key={listing.listing_id} role="option" aria-selected={false}>
							<button
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => onSuggestionSelect(listing.listing_name)}
								className="w-full text-left px-4 py-2 text-sm text-content-primary hover:bg-surface-hover"
							>
								{listing.listing_name}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
