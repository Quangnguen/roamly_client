import { DestinationRepository } from '@/src/data/repositories/destinationRepository';
import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';

export class DestinationUsecase {
    constructor(private destinationRepository: DestinationRepository) { }

    async getDestinations(params?: DestinationSearchParams): Promise<DestinationResponseInterface> {
        const response = await this.destinationRepository.getDestinations(params);
        return response;
    }

    async getPopularDestinations(): Promise<DestinationResponseInterface> {
        const response = await this.destinationRepository.getPopularDestinations();
        return response;
    }
}