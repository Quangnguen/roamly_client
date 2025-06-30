import { Post } from "@/src/domain/models/Post";

export interface PostSearchResponseInterface {
    message: string;
    statusCode: number;
    data: {
        currentPage: number;
        total: number;
        totalPages: number;
        results: Post[];
    };
}

export interface SearchPostParams {
    q: string; // query search
    limit?: number;
    page?: number;
} 