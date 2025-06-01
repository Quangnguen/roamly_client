import { CreateMemoryInterface } from "@/src/types/memoryInterface";

export interface MemoryRepository {
    createMemory(memoryData: CreateMemoryInterface): Promise<any>;
    getMemories(userId?: string): Promise<any>;
    updateMemory(memoryId: string, memoryData: Partial<CreateMemoryInterface>): Promise<any>;
    deleteMemory(memoryId: string): Promise<any>;
    
   
}