import { DestinationRepository } from '@/src/data/repositories/destinationRepository';
import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';

export class DestinationUsecase {
    constructor(private destinationRepository: DestinationRepository) { }

    async searchDestinations(params?: DestinationSearchParams): Promise<DestinationResponseInterface> {
        console.log('params', params);
        const response = await this.destinationRepository.searchDestinations(params);
        console.log('response', response);
        return response;
    }

    async getPopularDestinations(): Promise<DestinationResponseInterface> {
        const response = await this.destinationRepository.getPopularDestinations();
        return response;
    }

    async getFavoriteDestinations(): Promise<DestinationResponseInterface> {
        const response = await this.destinationRepository.getFavoriteDestinations();
        return response;
    }

    async getDestinationById(id: string): Promise<DestinationResponseInterface> {
        const response = await this.destinationRepository.getDestinationById(id);
        return response;
    }

    async getReviewsByDestinationId(id: string): Promise<DestinationResponseInterface> {
        console.log('id', id);
        const response = await this.destinationRepository.getReviewsByDestinationId(id);
        console.log('response', response);
        return response;
    }

    async toggleFavoriteDestination(targetId: string, type: string): Promise<any> {
        const response = await this.destinationRepository.toggleFavoriteDestination(targetId, type);
        return response;
    }

    async untoggleFavoriteDestination(targetId: string, type: string): Promise<any> {
        const response = await this.destinationRepository.untoggleFavoriteDestination(targetId, type);
        return response;
    }

    async addReviewDestination(id: string, review: FormData): Promise<any> {
        const response = await this.destinationRepository.addReviewDestination(id, review);
        return response;
    }
}