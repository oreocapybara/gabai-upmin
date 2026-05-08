"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/drawer/StarRating';

import DirectionsIcon from '@mui/icons-material/Directions';

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

interface Feedback {
    listing_id: number;
    nickname: string | null;
    rating: number;
    feedback_message: string | null;
    feedback_date: string;
}

interface ListingDetailsProps {
    listing: Listing;
    onBack: () => void;
    onSeeReviews: () => void;
    onRate: (rating: number) => void; 
}

export function ListingDetails({ listing, onBack, onSeeReviews, onRate }: ListingDetailsProps) {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('Feedback')
                .select('listing_id, nickname, rating, feedback_message, feedback_date')
                .eq('listing_id', listing.listing_id)
                .order('feedback_date', { ascending: false });

            if (error) {
                console.error('Error fetching feedbacks:', error);
            } else {
                setFeedbacks(data || []);
            }
        };
        fetchFeedbacks();
    }, [listing.listing_id]);

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-4"> 

                <div className="flex-shrink-0 relative w-20 h-20 border border-stroke-secondary rounded-lg overflow-hidden">
                    <Image 
                        src={listing.image_url || '/logo.svg'} 
                        alt={listing.listing_name} 
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="flex-grow min-w-0 text-left">
                    <h3 className="font-bold text-content-brand text-sm leading-tight">
                        {listing.listing_name}
                    </h3>
                    <p className="text-content-notice text-xs mt-0.5">
                        Total Rating here 
                    </p>
                    <p className="text-content-tertiary text-xs">
                        Price: {listing.price} 
                    </p>
                    <p className="text-content-tertiary text-xs mb-3">
                        {listing.category.category_name} 
                    </p>
                    <Button 
                        variant="default" 
                        size="default" 
                        className="!w-auto h-8 text-xs" 
                        leadingIcon={<DirectionsIcon />}
                    >
                        Directions
                    </Button>
                </div>
            </div>

            <div>
                <p className="text-content-tertiary text-sm mb-2">
                    Placeholder description here bla bla bla 
                </p>

                <p className="mb-2">
                Rate your experience
                </p>

                <div className="flex flex-col items-center gap-2 bg-surface-secondary rounded-xl py-6 border border-stroke-secondary mb-2">
                    <StarRating onRate={onRate}/>
                </div>

                <p className="mb-2">
                Recent reviews:
                </p>
                <div className="space-y-2">
                    {feedbacks.length > 0 ? (
                        feedbacks.map((feedback, index) => (
                            <div key={index} className="border border-stroke-secondary rounded-lg p-3 bg-surface-secondary">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-content-brand text-sm">{feedback.nickname || 'Anonymous'}</span>
                                    <span className="text-content-tertiary text-xs">Rating: {feedback.rating} stars</span>
                                </div>
                                <p className="text-content-tertiary text-sm mb-1">{feedback.feedback_message || 'No message'}</p>
                                <p className="text-content-tertiary text-xs">{new Date(feedback.feedback_date).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-content-tertiary text-sm">No reviews yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}