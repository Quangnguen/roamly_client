export interface LikeRepository {
    like(targetId: string, type: string): Promise<any>;
    unlike(targetId: string, type: string): Promise<any>;
}
