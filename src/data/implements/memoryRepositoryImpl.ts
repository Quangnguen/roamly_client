import { CreateMemoryInterface } from "@/src/types/memoryInterface";
import { MemoryRepository } from "../repositories/memoryRepository";
import { createMemoryApi, getMemoriesApi, updateMemoryApi, deleteMemoryApi } from "../api/memoryApi";

export class MemoryRepositoryImpl implements MemoryRepository {
    
    async createMemory(memoryData: CreateMemoryInterface): Promise<any> {
        try {
            const response = await createMemoryApi(memoryData);
            
            return {
                success: true,
                data: response.data || response,
                message: 'Memory created successfully'
            };
        } catch (error) {
            console.error('Error creating memory:', error);
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to create memory'
            };
        }
    }

    async getMemories(userId?: string): Promise<any> {
        try {
            const response = await getMemoriesApi(userId);
            
            return {
                success: true,
                data: response.data || response,
                message: 'Memories fetched successfully'
            };
        } catch (error) {
            console.error('Error fetching memories:', error);
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to fetch memories',
                data: []
            };
        }
    }

    async updateMemory(memoryId: string, memoryData: Partial<CreateMemoryInterface>): Promise<any> {
        try {
            if (!memoryId) {
                throw new Error('Memory ID is required');
            }

            const response = await updateMemoryApi(memoryId, memoryData);
            
            return {
                success: true,
                data: response.data || response,
                message: 'Memory updated successfully'
            };
        } catch (error) {
            console.error('Error updating memory:', error);
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to update memory'
            };
        }
    }

    async deleteMemory(memoryId: string): Promise<any> {
        try {
            if (!memoryId) {
                throw new Error('Memory ID is required');
            }

            const response = await deleteMemoryApi(memoryId);
            
            return {
                success: true,
                data: response.data || response,
                message: 'Memory deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting memory:', error);
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to delete memory'
            };
        }
    }

    async syncLocalData(): Promise<void> {
        // No implementation needed since we're not using cache
        console.log('Sync not needed - using direct API calls');
        return Promise.resolve();
    }

    getCachedMemories(userId?: string): CreateMemoryInterface[] {
        // No cache implementation - return empty array
        console.log('No cache available - use getMemories() instead');
        return [];
    }

    hasUnsyncedData(): boolean {
        // No local data to sync
        return false;
    }

    clearCache(): void {
        // No cache to clear
        console.log('No cache to clear');
    }
}