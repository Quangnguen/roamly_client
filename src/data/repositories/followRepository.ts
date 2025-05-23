export interface followRepository {
    followUser(followingId: string): Promise<any>;
    unfollowUser(followingId: string): Promise<any>;
    getFollowers(userId: string): Promise<any>;
    getFollowing(userId: string): Promise<any>;
}