// This page contains the types needed for implementation of logic and components

// ADMIN TYPE
export interface Admin {
    admin_id: number;
    username: string;
    password: string;
    email: string;
}

// ADMIN LOG TYPE
export interface AdminLog{
    log_id: number;
    admin_id: number;
    listing_id: number;
    status: string;
}

// CATEGORY TYPE
export interface Category{
    category_id: number;
    category_name: string;
}

export interface Coordinate{
    latitude: number;
    longitude: number;
}

// LISTING TYPE
export interface Listing{
    listing_id: number;
    category_id: number;
    listing_name: string;
    address: string;
    coordinate: Coordinate;

    image_url: string | null;
    opening_hours: string | null;
    closing_hours: string | null;
    price: number | null;
}

export interface Feedback{
    feedback_id: number;
    listing_id: number;
    rating: number;
    feedback_date: string;

    nickname: string | null;
    feedback_message: string | null;
}
