import { getDestinationsApi, getPopularDestinationsApi } from '../api/destinationApi';
import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';
import { DestinationRepository } from '../repositories/destinationRepository';

export class DestinationRepositoryImpl implements DestinationRepository {
    async getDestinations(params?: DestinationSearchParams): Promise<DestinationResponseInterface> {
        const response = await getDestinationsApi(params);
        return response;
    }
    async getPopularDestinations(): Promise<DestinationResponseInterface> {
        const response = await getPopularDestinationsApi();
        return response;
    }
}