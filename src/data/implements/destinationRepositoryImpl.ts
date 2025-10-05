import { addReviewDestinationApi, getPopularDestinationsApi } from '../api/destinationApi';
import { searchDestinationsApi } from '../api/destinationApi';
import { getDestinationByIdApi } from '../api/destinationApi';
import { getFavoriteDestinationsApi } from '../api/destinationApi';
import { getReviewsDestinationApi } from '../api/destinationApi';
import { toggleFavoriteDestinationApi } from '../api/destinationApi';
import { untoggleFavoriteDestinationApi } from '../api/destinationApi';
import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';
import { DestinationRepository } from '../repositories/destinationRepository';
import { getDestinationsByUserApi } from '../api/destinationApi';

export class DestinationRepositoryImpl implements DestinationRepository {
    async searchDestinations(params?: DestinationSearchParams): Promise<DestinationResponseInterface> {
        const response = await searchDestinationsApi(params);
        return response;
    }
    async getPopularDestinations(): Promise<DestinationResponseInterface> {
        const response = await getPopularDestinationsApi();
        return response;
    }
    async getFavoriteDestinations(): Promise<DestinationResponseInterface> {
        const response = await getFavoriteDestinationsApi();
        return response;
    }
    async getDestinationById(id: string): Promise<DestinationResponseInterface> {
        const response = await getDestinationByIdApi(id);
        return response;
    }
    async getReviewsByDestinationId(id: string): Promise<DestinationResponseInterface> {
        const response = await getReviewsDestinationApi(id);
        console.log('response', response);
        return response;
    }
    async toggleFavoriteDestination(targetId: string, type: string): Promise<any> {
        const response = await toggleFavoriteDestinationApi(targetId, type);
        return response;
    }
    async untoggleFavoriteDestination(targetId: string, type: string): Promise<any> {
        const response = await untoggleFavoriteDestinationApi(targetId, type);
        return response;
    }
    async addReviewDestination(id: string, review: FormData): Promise<any> {
        const response = await addReviewDestinationApi(id, review);
        return response;
    }

    async getDestinationsByUser(userId: string): Promise<DestinationResponseInterface> {
        const response = await getDestinationsByUserApi(userId);
        return response;
    }
}