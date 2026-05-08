"use client";

import Image from 'next/image';

import { useEffect, useState, } from 'react';

import { createClient } from '@/lib/supabase/client';

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StarRating } from '@/components/drawer/StarRating';

import DirectionsIcon from '@mui/icons-material/Directions';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

interface Listing {
    listing_id: number;
    listing_name: string;
    image_url: string;
    opening_hours: string | null;
    closing_hours: string | null;
    category: {
        category_name: string;
    };
    price: string;
    description: string;
}

interface ReviewSectionProps {
    listing: Listing;
    onBack: () => void;
    initialRating: number;
}

type DrawerView = 'list' | 'details' | 'reviews';

export function ReviewSection({ listing, onBack, initialRating = 0 }: ReviewSectionProps) {
    const [view, setView] = useState<DrawerView>('list');
    const [activeListing, setActiveListing] = useState<Listing | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [listings, setListings] = useState<Listing[]>([]);

    const [userRating, setUserRating] = useState(initialRating);

    useEffect(() => {
        setUserRating(initialRating);
    }, [initialRating]);

    useEffect(() => {
        const fetchListings = async () => {
            const supabase = createClient();
                
            const { data, error } = await supabase
                .from('Listing')
                .select('listing_name, image_url, opening_hours, closing_hours, Category(category_name)');

            if (error) {
                console.error('Error fetching listings:', error);
            } else if (data) {
                const formattedListings: Listing[] = data.map((item: any) => ({
                    listing_id: item.listing_id,
                    listing_name: item.listing_name,
                    image_url: item.image_url ?? '',
                    opening_hours: item.opening_hours,
                    closing_hours: item.closing_hours,
                    category: {
                        // We use item.Category (capital C) to match the select query
                        category_name: item.Category?.category_name || 'Uncategorized',
                    },
                    price: item.price,
                    description: item.description
                }));

                setListings(formattedListings);
            }
        };
        fetchListings();
    }, []);

    const handleOpenDetails = (listing: Listing) => {
        setActiveListing(listing);
        setView('details');
    };

    const handleGoBack = () => {
        if (view === 'reviews') {
            setView('details');
        } else {
            setView('list');
            setActiveListing(null);
        }
    };

    const isListingOpen = (opening: string | null, closing: string | null) => {
        if (!opening || !closing) return false;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [openH, openM] = opening.split(':').map(Number);
        const [closeH, closeM] = closing.split(':').map(Number);
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;
        if (closeMinutes < openMinutes) {
            // Overnight hours
            return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
        } else {
            return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
        }
    };

    return (
        <div>
            <p className="text-content-brand font-bold mb-2">
            You are reviewing:
            </p>
            <div className="space-y-3">
                <Card  className="border border-stroke-secondary shadow-none bg-surface-secondary">
                    <CardContent className="flex items-center gap-4 p-4 h-full">
                        <div className="flex-shrink-0">
                            <Image 
                                src='/logo.svg' 
                                alt={listing.listing_name} 
                                width={80}    
                                height={80} 
                                className="object-contain" 
                            />
                        </div>

                        <div className="flex-grow min-w-0 text-left">
                            <h3 className="font-bold text-content-brand text-sm">
                                {listing.listing_name}
                            </h3>
                            <p className="text-content-tertiary text-xs mb-3">
                                {listing.category.category_name} • 
                                <span className={isListingOpen(listing.opening_hours, listing.closing_hours) ? "text-green-600 font-medium" : "text-red-600"}>
                                    {isListingOpen(listing.opening_hours, listing.closing_hours) ? ' Open' : ' Closed'}
                                </span>
                            </p>
                            <div className="flex flex-row gap-2">
                                <Button 
                                variant="mono" 
                                size="sm" 
                                className="h-8 px-3 text-xs"
                                onClick={() => handleOpenDetails(listing)}> 
                                Details 
                                </Button>

                                <Button variant="default" size="default" className="!w-auto h-8 text-xs" leadingIcon={<DirectionsIcon />}>
                                Directions
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p>
                Rate your experience
                    </p>
                    <div className="flex flex-col items-center gap-2 bg-surface-secondary rounded-xl py-6 border border-stroke-secondary">
                        <StarRating 
                            initialValue={userRating} 
                            onRate={(val) => setUserRating(val)} 
                        />
                </div>

                <Input 
                    label="Name"
                    className="h-8" 
                />

                <Input 
                    label="Review"
                    className="h-24"
                />

                <Button variant="default" leadingIcon={<CheckOutlinedIcon />}>
                Submit Review
                </Button>
            </div>
        </div>  
    )
}