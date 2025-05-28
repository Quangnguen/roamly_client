import { FollowingResponseInterface } from "@/src/types/FollowingResponseInterface";
import { followRepository } from "../../data/repositories/followRepository";

export class followUsecase {
    constructor(private followRepository: followRepository) { }
    async followUser(followingId: string): Promise<any> {
        return await this.followRepository.followUser(followingId);
    }

    async unfollowUser(followingId: string): Promise<any> {
        return await this.followRepository.unfollowUser(followingId);
    }

    async getFollowers(): Promise<FollowingResponseInterface[]> {
        return await this.followRepository.getFollowers();
    }

    async getFollowing(): Promise<FollowingResponseInterface[]> {
        return await this.followRepository.getFollowing();
    }
}