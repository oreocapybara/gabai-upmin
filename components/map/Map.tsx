"use client";
import { useRef, useState, useCallback } from "react";
import { useMap } from "@/hooks/useMap";
import { MapMarker } from "./MapMarker";
import { ListingWithCategory } from "../../types/index";

interface MapProps {
	initialListings: ListingWithCategory[];
}

export default function Map({ initialListings }: MapProps) {
	const mapWrapperRef = useRef<HTMLDivElement>(null); // The wrapper around the map
	const map = useMap(mapWrapperRef);
	const [selectedListingId, setSelectedListingId] = useState<
		ListingWithCategory["listing_id"] | null
	>(null);

	const handleSelect = useCallback((listing: ListingWithCategory) => {
		setSelectedListingId(listing.listing_id);
	}, []);

	return (
		<>
			<div className="w-screen" ref={mapWrapperRef} />
			{map &&
				initialListings.map((item) => (
					<MapMarker
						key={item.listing_id}
						map={map}
						listing={item}
						isSelected={selectedListingId === item.listing_id}
						onSelect={handleSelect}
					/>
				))}
		</>
	);
}
