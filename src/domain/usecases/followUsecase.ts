import { followRepository } from "../../data/repositories/followRepository";

export class followUsecase {
    constructor(private followRepository: followRepository) { }
    async followUser(followingId: string): Promise<any> {
        return await this.followRepository.followUser(followingId);
    }

    async unfollowUser(followingId: string): Promise<any> {
        return await this.followRepository.unfollowUser(followingId);
    }

    async getFollowers(userId: string): Promise<any> {
        return await this.followRepository.getFollowers(userId);
    }

    async getFollowing(userId: string): Promise<any> {
        return await this.followRepository.getFollowing(userId);
    }
}