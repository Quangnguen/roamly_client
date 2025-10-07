// Entry fee structure
export interface EntryFee {
    adult: number;
    child: number;
    currency: string;
}

// Main destination entity
export interface Destination {
    id: string;
    title: string;
    description: string;
    location: string;
    city: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    category: string[];
    imageUrl: string[];
    tags: string[];
    visitCount: number;
    likeCount: number;
    open: string;
    close: string;
    reviewCount: number;
    rating: number;
    bestTimeToVisit: string;
    entryFee: EntryFee;
    openingHours: string;
    facilities: string[];
    activities: string[];
    travelTips: string[];
    isPublic: boolean;
    parentId: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        username: string;
        name: string;
        profilePic: string;
    };
    subLocations: Destination[]; // Recursive for nested locations
    isLiked: boolean;
}