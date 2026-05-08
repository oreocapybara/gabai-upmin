'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { showToast } from "@/components/ui/CustomToast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

interface Category {
  category_id: number;
  category_name: string;
}

interface ListingFormProps {
  categories: Category[];
  initialData: any | null;
  isEditing: boolean;
}

export default function ListingForm({ 
  categories, 
  initialData, 
  isEditing 
}: ListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null
  );
  
  const [formData, setFormData] = useState({
    listing_name: initialData?.listing_name || "",
    category_id: initialData?.category_id || categories[0]?.category_id || "",
    coord_latitude: initialData?.coord_latitude || "",
    coord_longitude: initialData?.coord_longitude || "",
    image_url: initialData?.image_url || "",
    opening_hours: initialData?.opening_hours || "",
    closing_hours: initialData?.closing_hours || "",
    price: initialData?.price || "",
    description: initialData?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    const submitData = {
      listing_name: formData.listing_name,
      category_id: parseInt(formData.category_id),
      coord_latitude: parseFloat(formData.coord_latitude),
      coord_longitude: parseFloat(formData.coord_longitude),
      image_url: formData.image_url || null,
      opening_hours: formData.opening_hours || null,
      closing_hours: formData.closing_hours || null,
      price: formData.price ? parseFloat(formData.price) : null,
      description: formData.description || null,
    };

    try {
      let result;
      if (isEditing && initialData?.listing_id) {
        result = await supabase
          .from('Listing')
          .update(submitData)
          .eq('listing_id', initialData.listing_id);
      } else {
        result = await supabase
          .from('Listing')
          .insert([submitData]);
      }

      if (result.error) throw result.error;

      // Colored toasts
      if (isEditing) {
        showToast.warning("Listing updated successfully!"); // Orange for edit
      } else {
        showToast.success("Listing created successfully!"); // Green for create
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save listing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Update image preview when image_url changes
    if (name === 'image_url') {
      setImagePreview(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-4 pb-28">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#8A1538] text-lg">
              {isEditing ? "Edit Listing" : "Create New Listing"}
            </CardTitle>
            <CardDescription className="text-xs">
              Add a new building, dormitory, or facility to the map
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Category */}
              <div>
                <Label htmlFor="category_id" className="text-xs font-medium block mb-1">
                  Category *
                </Label>
                <select
                  id="category_id"
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] text-gray-900 bg-white text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Listing Name */}
              <div>
                <Label htmlFor="listing_name" className="text-xs font-medium block mb-1">
                  Listing Name *
                </Label>
                <Input
                  id="listing_name"
                  name="listing_name"
                  type="text"
                  required
                  value={formData.listing_name}
                  onChange={handleChange}
                  placeholder="e.g., CHSS Building"
                  className="text-sm h-10 w-full box-border"
                />
              </div>

              {/* Coordinates - Fixed with custom styling */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <Label htmlFor="coord_latitude" className="text-xs font-medium block mb-1">
                    Latitude *
                  </Label>
                  <input
                    id="coord_latitude"
                    name="coord_latitude"
                    type="number"
                    step="any"
                    required
                    value={formData.coord_latitude}
                    onChange={handleChange}
                    placeholder="7.0589"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] text-sm text-gray-900 bg-white box-border"
                    style={{ 
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      minWidth: 0
                    }}
                  />
                </div>
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <Label htmlFor="coord_longitude" className="text-xs font-medium block mb-1">
                    Longitude *
                  </Label>
                  <input
                    id="coord_longitude"
                    name="coord_longitude"
                    type="number"
                    step="any"
                    required
                    value={formData.coord_longitude}
                    onChange={handleChange}
                    placeholder="125.6000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] text-sm text-gray-900 bg-white box-border"
                    style={{ 
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      minWidth: 0
                    }}
                  />
                </div>
              </div>

              {/* Hours - Fixed with custom styling */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <Label htmlFor="opening_hours" className="text-xs font-medium block mb-1">
                    Opening Hours
                  </Label>
                  <input
                    id="opening_hours"
                    name="opening_hours"
                    type="time"
                    value={formData.opening_hours || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] text-sm text-gray-900 bg-white box-border"
                    style={{ minWidth: 0 }}
                  />
                </div>
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <Label htmlFor="closing_hours" className="text-xs font-medium block mb-1">
                    Closing Hours
                  </Label>
                  <input
                    id="closing_hours"
                    name="closing_hours"
                    type="time"
                    value={formData.closing_hours || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] text-sm text-gray-900 bg-white box-border"
                    style={{ minWidth: 0 }}
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price" className="text-xs font-medium block mb-1">
                  Price (if applicable)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="₱ 10 - 20"
                  className="text-sm h-10 w-full box-border"
                />
              </div>

              {/* Image URL with Preview */}
              <div>
                <Label htmlFor="image_url" className="text-xs font-medium block mb-1">
                  Image URL
                </Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="text-sm h-10 w-full box-border"
                />
                
                {/* Image Preview */}
                {imagePreview && imagePreview.trim() !== "" && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-xs font-medium block mb-1">
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] resize-none text-sm text-gray-900 bg-white box-border"
                  placeholder="Describe the location..."
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="flex-1 h-10 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#8A1538] hover:bg-[#6d102d] text-white h-10 text-sm"
                >
                  {isLoading 
                    ? (isEditing ? "Saving..." : "Creating...") 
                    : (isEditing ? "Update" : "Create")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}