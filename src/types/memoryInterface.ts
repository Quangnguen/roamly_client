export interface CreateMemoryInterface {
    title: string;
    description: string;
    tags?: string[];
    startDate?: string;
    endDate?: string;
    homestay: string;
    placesVisited?: string[];
    participants?: string[];
    privacy?: string;
    cost: object;
    images?: string[]; // Array of image URIs
}