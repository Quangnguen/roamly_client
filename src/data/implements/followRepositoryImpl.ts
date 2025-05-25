import { followRepository } from "../repositories/followRepository";
import { followApi, unfollowApi, getFollowersApi, getFollowingApi } from "../api/followApi";

export class followRepositoryImpl implements followRepository {
    async followUser(followingId: string): Promise<any> {
        try {
            const response = await followApi(followingId);
            return response;
        } catch (error) {
            console.error('Failed to follow user:', error);
            throw new Error('Failed to follow user');
        }
    }

    async unfollowUser(followingId: string): Promise<any> {
        try {
            const response = await unfollowApi(followingId);
            return response;
        } catch (error) {
            console.error('Failed to unfollow user:', error);
            throw new Error('Failed to unfollow user');
        }
    }

    async getFollowers(userId: string): Promise<any> {
        try {
            const response = await getFollowersApi(userId);
            return response;
        } catch (error) {
            console.error('Failed to get followers:', error);
            throw new Error('Failed to get followers');
        }
    }

    async getFollowing(): Promise<any> {
        try {
            const response = await getFollowingApi();
            return response;
        } catch (error) {
            console.error('Failed to get following:', error);
            throw new Error('Failed to get following');
        }
    }
}