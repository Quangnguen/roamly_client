import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CreateMemoryInterface } from '@/src/types/memoryInterface';
import { createMemoryApi, getMemoriesApi, updateMemoryApi, deleteMemoryApi } from '@/src/data/api/memoryApi';
import { dependencies } from '@/src/dependencies/dependencies';
import { clearMessage } from './userSlice';

// Define the state interface
interface MemoryState {
    memories: CreateMemoryInterface[];
    myMemories?: CreateMemoryInterface[];
    loading: boolean;
    error: string | null;
    deletingIds: string[];
    updating: boolean;
    message?: string;
    status?: string;
    statusCode?: number;
}

// Initial state
const initialState: MemoryState = {
    memories: [],
    loading: false,
    error: null,
    deletingIds: [],
    updating: false,
    message: undefined,
    status: undefined,
    statusCode: undefined,
};

// Async thunks
export const fetchMyMemories = createAsyncThunk(
    'memory/fetchMyMemories',
    async (_: void, { rejectWithValue }) => {
        try {
            const response = await dependencies.MemoryUseCase.getMemories();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch memories');
        }
    }
);

export const fetchMemories = createAsyncThunk(
    'memory/fetchMemories',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await dependencies.MemoryUseCase.getMemories(userId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch memories');
        }
    }
);


export const createMemory = createAsyncThunk(
    'memory/createMemory',
    async (memoryData: CreateMemoryInterface, { rejectWithValue }) => {
        try {
            const response = await dependencies.MemoryUseCase.createMemory(memoryData);
            console.log('Create memory response:', response);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create memory');
        }
    }
);

export const updateMemory = createAsyncThunk(
    'memory/updateMemory',
    async ({ id, data }: { id: string; data: Partial<CreateMemoryInterface> }, { rejectWithValue }) => {
        try {
            const response = await updateMemoryApi(id, data);
            return { id, data: response.data || response };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update memory');
        }
    }
);

export const deleteMemory = createAsyncThunk(
    'memory/deleteMemory',
    async (memoryId: string, { rejectWithValue }) => {
        try {
            return await dependencies.MemoryUseCase.deleteMemory(memoryId);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete memory');
        }
    }
);

// Slice
const memorySlice = createSlice({
    name: 'memory',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMemories: (state) => {
            state.memories = [];
        },
        updateMemoryLocal: (state, action: PayloadAction<{ id: string; data: Partial<CreateMemoryInterface> }>) => {
            const { id, data } = action.payload;
            const index = state.memories.findIndex(memory => memory.id === id);
            if (index !== -1) {
                state.memories[index] = { ...state.memories[index], ...data };
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        clearMemoryMessage: (state) => {
            state.message = undefined;
            state.status = undefined;
            state.statusCode = undefined;
        }
    },
    extraReducers: (builder) => {
        // Fetch memories
        builder
            .addCase(fetchMyMemories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyMemories.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.status = action.payload.status;
                state.statusCode = action.payload.statusCode;
                state.myMemories = action.payload.data;
            })
            .addCase(fetchMyMemories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create memory
        builder
            .addCase(createMemory.pending, (state) => {
                state.loading = true;
                state.error = null;

            })
            .addCase(createMemory.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload.message;
                state.status = action.payload.status;
                state.statusCode = action.payload.statusCode;
                state.myMemories =  [...(state.myMemories ?? []), action.payload.data];
            })
            .addCase(createMemory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update memory
        builder
            .addCase(updateMemory.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateMemory.fulfilled, (state, action) => {
                state.updating = false;
                const { id, data } = action.payload;
                const index = state.memories.findIndex(memory => memory.id === id);
                if (index !== -1) {
                    state.memories[index] = { ...state.memories[index], ...data };
                }
            })
            .addCase(updateMemory.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload as string;
            });

        // Delete memory
        builder
            .addCase(deleteMemory.pending, (state, action) => {
                // Add to deleting list for UI feedback
                state.deletingIds.push(action.meta.arg);
                state.error = null;
            })
            .addCase(deleteMemory.fulfilled, (state, action) => {
                const memoryId = action.payload;
                state.memories = state.memories.filter(memory => memory.id !== memoryId);
                state.deletingIds = state.deletingIds.filter(id => id !== memoryId);
                state.message = action.payload.message;
                state.status = action.payload.status;
                state.statusCode = action.payload.statusCode;
            })
            .addCase(deleteMemory.rejected, (state, action) => {
                const memoryId = action.meta.arg;
                state.deletingIds = state.deletingIds.filter(id => id !== memoryId);
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchMemories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMemories.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.status = action.payload.status;
                state.statusCode = action.payload.statusCode;
                state.memories = action.payload.data;
            })
            .addCase(fetchMemories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const {
    clearError,
    clearMemories,
    updateMemoryLocal,
    setLoading, 
    clearMemoryMessage,  
} = memorySlice.actions;

export default memorySlice.reducer;