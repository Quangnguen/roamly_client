import { likeApi, unlikeApi } from "../api/likeApi";
import { LikeRepository } from "../repositories/likeRepository";

export class LikeRepositoryImpl implements LikeRepository {
    async like(targetId: string, type: string): Promise<any> {
        try {
            const response = await likeApi(targetId, type);
            return response;
        } catch (error) {
            throw new Error('Failed to like');
        }
    }

    async unlike(targetId: string, type: string): Promise<any> {
        try {
            const response = await unlikeApi(targetId, type);
            return response;
        } catch (error) {
            throw new Error('Failed to unlike');
        }
    }
}
