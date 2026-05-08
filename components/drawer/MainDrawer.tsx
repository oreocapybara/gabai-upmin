"use client";

import Image from 'next/image';

import { useEffect, useState, } from 'react';
import { Global } from '@emotion/react';

import { createClient } from '@/lib/supabase/client';

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from '@/components/ui/Button';

import { Box, SwipeableDrawer } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DirectionsIcon from '@mui/icons-material/Directions';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';

import { ListingDetails } from '@/components/drawer/ListingDetails';
import { ReviewSection } from '@/components/drawer/ReviewSection';

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

const PULLER_HEIGHT = 86; // The height of the "tab" visible at the bottom

type DrawerView = 'list' | 'details' | 'reviews';

export function MainDrawer() {
    const [view, setView] = useState<DrawerView>('list');
    const [activeListing, setActiveListing] = useState<Listing | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [listings, setListings] = useState<Listing[]>([]);
    const [pendingRating, setPendingRating] = useState<number>(0);

    useEffect(() => {
        const fetchListings = async () => {
            const supabase = createClient();
                
            const { data, error } = await supabase
                .from('Listing')
                .select('listing_id, listing_name, image_url, opening_hours, closing_hours, Category(category_name)');

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

    const toggleDrawer = (newOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event && event.type === 'keydown' && 
           ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setIsOpen(newOpen);
        if (!newOpen) handleGoBack(); // Reset view on close
    };

    return (
        <Box>
            <Global
                styles={{
                    '.MuiDrawer-root > .MuiPaper-root': {
                        height: `calc(50% - ${PULLER_HEIGHT}px)`,
                        overflow: 'visible', 
                        zIndex: 2000, 
                    },
                }}
            />

            <SwipeableDrawer
                anchor="bottom"
                open={isOpen}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
                swipeAreaWidth={PULLER_HEIGHT}
                hideBackdrop={true}
                ModalProps={{ keepMounted: true }}
            >
                {/* --- PULLER TAB (Header) --- */}
                <Box 
                    className="absolute left-0 right-0 flex flex-col items-center bg-surface-primary border-t-2 border-l-2 border-r-2 border-stroke-secondary rounded-t-3xl"
                    style={{ 
                        top: -PULLER_HEIGHT, 
                        height: PULLER_HEIGHT,
                        visibility: 'visible',
                    }}
                >
                    <Box className="w-10 h-1.5 rounded-full bg-stroke-secondary mt-4 mb-1" /> 
                    
                    <Box className="flex w-full justify-between items-center px-4">
                        <Button variant="mono" size="icon" className="text-content-tertiary">
                            PLACEHOLDER
                        </Button>

                        <Button 
                            variant="mono" 
                            size="icon"
                            className="flex items-center justify-center [&_svg]:!size-8" 
                            onClick={(e) => {
                                if (view === 'list') {
                                    toggleDrawer(false)(e); 
                                } else {
                                    handleGoBack();
                                }
                            }}
                        >
                            {view !== 'list' ? (
                                <KeyboardReturnOutlinedIcon className="text-content-tertiary"/>
                            ) : (
                                <HighlightOffIcon className="text-content-tertiary"/>
                            )}
                        </Button>
                    </Box>
                </Box>

                {/* --- CONTENT BODY --- */}
                <Box 
                    className="bg-surface-primary px-4 pb-8 overflow-y-auto h-full border-l-2 border-r-2 border-stroke-secondary"
                    style={{ minHeight: '100px' }} // Ensures the box doesn't collapse
                >
                    <div className="mt-4">
                        {view === 'list' && (
                            <div className="space-y-3">
                                {listings.length > 0 ? (
                                    listings.map((listing, index) => (
                                        <Card key={index} className="border border-stroke-secondary shadow-none bg-surface-secondary">
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
                                    ))
                                ) : (
                                    /* For debugging if the array is empty */
                                    <div className="text-center py-10 text-xs text-content-tertiary uppercase tracking-widest">
                                        Loading listings...
                                    </div>
                                )}
                            </div>
                        )}

                        {view === 'details' && activeListing && (
                            <ListingDetails 
                                listing={activeListing} 
                                onBack={handleGoBack}
                                onSeeReviews={() => setView('reviews')}
                                onRate={(rating) => {
                                    setPendingRating(rating);
                                    setView('reviews');
                                }} 
                            />
                        )}

                        {view === 'reviews' && activeListing && (
                            <ReviewSection 
                                listing={activeListing} 
                                onBack={() => setView('details')} 
                                initialRating={pendingRating}
                            />
                        )}
                    </div>
                </Box>
            </SwipeableDrawer>
        </Box>
    );
}