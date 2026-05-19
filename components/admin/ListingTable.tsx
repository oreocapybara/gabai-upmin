'use client';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Edit from '@mui/icons-material/EditRounded';
import { getListingHoursStatus } from "@/lib/utils";

interface ListingWithCategory {
  listing_id: number;
  listing_name: string;
  coord_latitude: number;
  coord_longitude: number;
  image_url: string | null;
  opening_hours: string | null;
  closing_hours: string | null;
  price_min: number | null;
  price_max: number | null;
  Category: {
    category_name: string;
  } | null;
}

interface ListingTableProps {
  initialListings: ListingWithCategory[];
}

export default function ListingTable({ initialListings }: ListingTableProps) {
  const [listings, setListings] = useState(initialListings);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('Listing')
      .delete()
      .eq('listing_id', deleteTarget.id);
    
    if (!error) {
      setListings(listings.filter(l => l.listing_id !== deleteTarget.id));
    }
    
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="space-y-4">
        {listings.map((listing) => (
          <div key={listing.listing_id} className="flex gap-4 py-4 border-b border-gray-100">
            {/* Image Placeholder */}
            <div className="w-28 h-28 bg-gray-200 rounded flex-shrink-0" />
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex flex-col gap-2">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-base font-montserrat">
                  {listing.listing_name}
                </h3>
                
                {/* Category and Status */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 text-sm">
                    {listing.Category?.category_name || "Uncategorized"}
                  </span>
                  {(() => {
                    const s = getListingHoursStatus(listing.opening_hours, listing.closing_hours);
                    return (
                      <span className={s === "open" ? "text-green-700 text-sm" : s === "closed" ? "text-red-600 text-sm" : "text-gray-400 text-sm"}>
                        {s === "open" ? "Open" : s === "closed" ? "Closed" : "Hours vary"}
                      </span>
                    );
                  })()}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-1.5 mt-2">
                  <a
                    href={`/admin/manage?listing_id=${listing.listing_id}`}
                    className="px-4 py-1 border border-gray-300 rounded-2xl text-[#8A1538] font-semibold text-sm"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => setDeleteTarget({ 
                      id: listing.listing_id, 
                      name: listing.listing_name 
                    })}
                    className="px-4 py-1 bg-[#8A1538] text-white rounded-2xl font-semibold text-sm flex items-center gap-1"
                  >
                    <Edit/>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        listingName={deleteTarget?.name || ""}
        isLoading={isDeleting}
      />
    </>
  );
}