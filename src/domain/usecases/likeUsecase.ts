import { LikeRepository } from "@/src/data/repositories/likeRepository";

export class LikeUsecase {
    constructor(private likeRepository: LikeRepository) {
        this.likeRepository = likeRepository;
    }

    async like(targetId: string, type: string): Promise<any> {
        return await this.likeRepository.like(targetId, type);
    }

    async unlike(targetId: string, type: string): Promise<any> {
        return await this.likeRepository.unlike(targetId, type);
    }

}
