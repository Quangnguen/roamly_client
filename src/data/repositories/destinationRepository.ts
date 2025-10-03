import { getDestinationsApi } from '../api/destinationApi';
import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';

export interface DestinationRepository {
    getDestinations(params?: DestinationSearchParams): Promise<DestinationResponseInterface>;
    getPopularDestinations(): Promise<DestinationResponseInterface>;
}