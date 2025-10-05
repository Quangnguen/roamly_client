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

    async getDestinationsByUser(userId: string): Promise<DestinationResponseInterface> {
        const response = await this.destinationRepository.getDestinationsByUser(userId);
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
}