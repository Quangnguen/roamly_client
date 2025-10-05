import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';

export interface DestinationRepository {
    searchDestinations(params?: DestinationSearchParams): Promise<DestinationResponseInterface>;
    getPopularDestinations(): Promise<DestinationResponseInterface>;
    getFavoriteDestinations(): Promise<DestinationResponseInterface>;
    getDestinationById(id: string): Promise<DestinationResponseInterface>;
    toggleFavoriteDestination(targetId: string, type: string): Promise<any>;
    untoggleFavoriteDestination(targetId: string, type: string): Promise<any>;
    getDestinationsByUser(userId: string): Promise<DestinationResponseInterface>;
}