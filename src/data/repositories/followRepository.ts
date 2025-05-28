import { FollowingResponseInterface } from "@/src/types/FollowingResponseInterface";

export interface followRepository {
    followUser(followingId: string): Promise<any>;
    unfollowUser(followingId: string): Promise<any>;
    getFollowers(): Promise<FollowingResponseInterface[]>;
    getFollowing(): Promise<FollowingResponseInterface[]>;
}