import { LikeRepository } from "@/src/data/repositories/likeRepository";

export class LikeUsecase {
    constructor(private likeRepository: LikeRepository) {
        this.likeRepository = likeRepository;
    }

    async like(postId: string, type: string): Promise<any> {
        return await this.likeRepository.like(postId, type);
    }

    async unlike(postId: string, type: string): Promise<any> {
        return await this.likeRepository.unlike(postId, type);
    }

}
