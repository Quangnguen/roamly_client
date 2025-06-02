import { CreateMemoryInterface } from "@/src/types/memoryInterface";
import { MemoryRepository } from "../repositories/memoryRepository";
import { createMemoryApi, getMemoriesApi, updateMemoryApi, deleteMemoryApi } from "../api/memoryApi";

export class MemoryRepositoryImpl implements MemoryRepository {
    
    async createMemory(memoryData: CreateMemoryInterface): Promise<any> {
        try {
            const response = await createMemoryApi(memoryData);
            
            return response;
        } catch (error) {
            console.error('Error creating memory:', error);
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to create memory',
                status: 'error',
                statusCode: 500,
            };
        }
    }

    async getMemories(userId?: string): Promise<any> {
        try {
            const response = await getMemoriesApi(userId);
            
            return response;
        } catch (error) {
            console.error('Error fetching memories:', error);
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to fetch memories',
                data: [],
                status: 'error',
                statusCode: 500,
            };
        }
    }

    async updateMemory(memoryId: string, memoryData: Partial<CreateMemoryInterface>): Promise<any> {
        try {
            if (!memoryId) {
                throw new Error('Memory ID is required');
            }

            const response = await updateMemoryApi(memoryId, memoryData);
            
            return response;
        } catch (error) {
            console.error('Error updating memory:', error);
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to update memory',
                status: 'error',
                statusCode: 500,
            };
        }
    }

    async deleteMemory(memoryId: string): Promise<any> {
        try {
            if (!memoryId) {
                throw new Error('Memory ID is required');
            }

            const response = await deleteMemoryApi(memoryId);
            
            return response;
        } catch (error) {
            console.error('Error deleting memory:', error);
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to delete memory',
                status: 'error',
                statusCode: 500,
            };
        }
    }

   
}