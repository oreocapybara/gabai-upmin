'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Plus, LayoutGrid, Edit, Trash2 } from "lucide-react";
import { Toaster } from "sonner";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { Badge } from "@/components/ui/Badge";
import { showToast } from "@/components/ui/CustomToast";

interface ListingWithCategory {
  listing_id: number;
  listing_name: string;
  coord_latitude: number;
  coord_longitude: number;
  image_url: string | null;
  opening_hours: string | null;
  closing_hours: string | null;
  price: number | null;
  description?: string;
  category_id: number;
  Category: {
    category_id: number;
    category_name: string;
  } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const supabase = createClient();

  const fetchListings = async () => {
    setLoading(true);
    const { data: listings, error } = await supabase
      .from('Listing')
      .select('*')
      .order('listing_id', { ascending: false });

    if (error) {
      console.error("Error fetching listings:", error);
      setLoading(false);
      return;
    }

    const { data: categories } = await supabase
      .from('Category')
      .select('category_id, category_name');

    const listingsWithCategories = listings.map(listing => ({
      ...listing,
      Category: categories?.find(c => c.category_id === listing.category_id) || null
    }));

    setListings(listingsWithCategories);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('Listing')
      .delete()
      .eq('listing_id', deleteTarget.id);
    
    if (error) {
      showToast.error("Failed to delete listing");
    } else {
      showToast.delete(`"${deleteTarget.name}" has been deleted`);
      setListings(listings.filter(l => l.listing_id !== deleteTarget.id));
    }
    
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.listing_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || listing.Category?.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(listings.map(l => l.Category?.category_name).filter(Boolean))];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Toaster - MUST be at top level, not inside positioned divs */}
      <Toaster position="top-center" closeButton />
      
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-[#8A1538] px-4 py-3 flex items-center justify-between gap-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 bg-[#500C20] rounded-full"></div>
        </div>
        
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-full text-sm outline-none"
            />
          </div>
        </div>
        
        <LayoutGrid size={24} className="text-white flex-shrink-0" />
      </div>

      {/* Main Content */}
      <div className="px-4 py-5">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#8A1538]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M7 10L12 15L17 10" stroke="#9EA2AE" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <a
            href="/admin/manage"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-full text-[#8A1538] font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <Plus size={18} />
            <span>Create</span>
          </a>
        </div>

        <h1 className="text-[#8A1538] text-xl font-semibold font-montserrat mb-4">
          Dashboard
        </h1>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No listings found</div>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => (
              <div key={listing.listing_id} className="flex gap-3 py-3 border-b border-gray-100">
                {/* Fixed Image Display */}
                {listing.image_url ? (
                  <img 
                    src={listing.image_url} 
                    alt={listing.listing_name}
                    className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No image</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base font-montserrat line-clamp-2">
                    {listing.listing_name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 text-sm">
                      {listing.Category?.category_name || "Uncategorized"}
                    </span>
                    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                      Open
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <a
                      href={`/admin/manage?listing_id=${listing.listing_id}`}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-[#8A1538] font-semibold text-xs"
                    >
                      <Edit size={12} />
                      Edit
                    </a>
                    <button
                      onClick={() => setDeleteTarget({ 
                        id: listing.listing_id, 
                        name: listing.listing_name 
                      })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#8A1538] text-white rounded-full font-semibold text-xs"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        listingName={deleteTarget?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}