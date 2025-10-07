import { CreateMemoryInterface } from "@/src/types/memoryInterface";
import { MemoryRepository } from "@/src/data/repositories/memoryRepository";

export class MemoryUseCase {
    constructor(private memoryRepository: MemoryRepository) {}

    /**
     * Tạo memory mới
     */
    async createMemory(memoryData: CreateMemoryInterface): Promise<any> {
        try {
            // Validate dữ liệu trước khi tạo
            this.validateMemoryData(memoryData);
            
            // Gọi repository để tạo memory
            return await this.memoryRepository.createMemory(memoryData);
            
            
        } catch (error) {
            console.error('Create memory use case error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to create memory',
                status: 'error',
                statusCode: 500,
            };
        }
    }

    /**
     * Lấy danh sách memories
     */
    async getMemories(userId?: string): Promise<any> {
        try {
            return await this.memoryRepository.getMemories(userId);
            
           
        } catch (error) {
            console.error('Get memories use case error:', error);
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

    /**
     * Cập nhật memory
     */
    async updateMemory(memoryId: string, memoryData: Partial<CreateMemoryInterface>): Promise<any> {
        try {
            if (!memoryId) {
                throw new Error('Memory ID is required');
            }

            // Validate dữ liệu cập nhật
            this.validatePartialMemoryData(memoryData);
            
            return await this.memoryRepository.updateMemory(memoryId, memoryData);
            
           
        } catch (error) {
            console.error('Update memory use case error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to update memory',
                status: 'error',
                statusCode: 500,
            };
        }
    }

    /**
     * Xóa memory
     */
    async deleteMemory(memoryId: string): Promise<any> {
        try {
            if (!memoryId) {
                throw new Error('Memory ID is required');
            }
            
            return await this.memoryRepository.deleteMemory(memoryId);
            
        } catch (error) {
            console.error('Delete memory use case error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to delete memory',
                status: 'error',
                statusCode: 500,
                data: null,
            };
        }
    }

   
    async filterMemories(filters: {
        userId?: string;
        tags?: string[];
        locations?: string[];
        dateFrom?: string;
        dateTo?: string;
        participants?: string[];
    }): Promise<any> {
        try {
            const result = await this.getMemories(filters.userId);
            
            if (!result.success) {
                return result;
            }

            let filteredMemories = result.data;

            // Lọc theo tags
            if (filters.tags && filters.tags.length > 0) {
                filteredMemories = filteredMemories.filter((memory: CreateMemoryInterface) =>
                    memory.tags?.some(tag => filters.tags!.includes(tag))
                );
            }

            // Lọc theo địa điểm
            if (filters.locations && filters.locations.length > 0) {
                filteredMemories = filteredMemories.filter((memory: CreateMemoryInterface) =>
                    memory.placesVisited?.some(place => filters.locations!.includes(place))
                );
            }

            // Lọc theo thời gian
            if (filters.dateFrom || filters.dateTo) {
                filteredMemories = filteredMemories.filter((memory: CreateMemoryInterface) => {
                    const memoryDate = new Date(memory.startDate ?? "");
                    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
                    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

                    if (fromDate && memoryDate < fromDate) return false;
                    if (toDate && memoryDate > toDate) return false;
                    return true;
                });
            }

            // Lọc theo thành viên tham gia
            if (filters.participants && filters.participants.length > 0) {
                filteredMemories = filteredMemories.filter((memory: CreateMemoryInterface) =>
                    memory.participants?.some(participant => filters.participants!.includes(participant))
                );
            }

            return {
                success: true,
                data: filteredMemories,
                message: 'Memories filtered successfully'
            };
        } catch (error) {
            console.error('Filter memories use case error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to filter memories'
            };
        }
    }

    /**
     * Tìm kiếm memories theo keyword
     */
    async searchMemories(keyword: string, userId?: string): Promise<any> {
        try {
            if (!keyword.trim()) {
                return this.getMemories(userId);
            }

            const result = await this.getMemories(userId);
            
            if (!result.success) {
                return result;
            }

            const searchKeyword = keyword.toLowerCase().trim();
            const filteredMemories = result.data.filter((memory: CreateMemoryInterface) => {
                return (
                    memory.title?.toLowerCase().includes(searchKeyword) ||
                    memory.description?.toLowerCase().includes(searchKeyword) ||
                    memory.tags?.some(tag => tag.toLowerCase().includes(searchKeyword)) ||
                    memory.placesVisited?.some(place => place.toLowerCase().includes(searchKeyword)) ||
                    memory.participants?.some(participant => participant.toLowerCase().includes(searchKeyword))
                );
            });

            return {
                success: true,
                data: filteredMemories,
                message: 'Memories searched successfully'
            };
        } catch (error) {
            console.error('Search memories use case error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to search memories'
            };
        }
    }

    /**
     * Validate dữ liệu memory khi tạo mới
     */
    private validateMemoryData(memoryData: CreateMemoryInterface): void {
        if (!memoryData.title?.trim()) {
            throw new Error('Title is required');
        }

        if (!memoryData.startDate) {
            throw new Error('Start date is required');
        }

        // Validate date format
        if (!this.isValidDate(memoryData.startDate)) {
            throw new Error('Invalid start date format');
        }

        if (memoryData.endDate && !this.isValidDate(memoryData.endDate)) {
            throw new Error('Invalid end date format');
        }

        // Validate end date phải sau start date
        if (memoryData.endDate && new Date(memoryData.endDate) < new Date(memoryData.startDate)) {
            throw new Error('End date must be after start date');
        }

        // Validate images array
        if (memoryData.images && (!Array.isArray(memoryData.images) || memoryData.images.length === 0)) {
            throw new Error('At least one image is required');
        }
    }

    /**
     * Validate dữ liệu memory khi cập nhật (partial)
     */
    private validatePartialMemoryData(memoryData: Partial<CreateMemoryInterface>): void {
        if (memoryData.title !== undefined && !memoryData.title.trim()) {
            throw new Error('Title cannot be empty');
        }

        if (memoryData.startDate && !this.isValidDate(memoryData.startDate)) {
            throw new Error('Invalid start date format');
        }

        if (memoryData.endDate && !this.isValidDate(memoryData.endDate)) {
            throw new Error('Invalid end date format');
        }

        // Validate end date phải sau start date (nếu cả 2 đều có)
        if (memoryData.startDate && memoryData.endDate) {
            if (new Date(memoryData.endDate) < new Date(memoryData.startDate)) {
                throw new Error('End date must be after start date');
            }
        }
    }

    /**
     * Kiểm tra format date hợp lệ
     */
    private isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
}