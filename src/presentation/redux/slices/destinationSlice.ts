import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dependencies } from '@/src/dependencies/dependencies';
import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';
import { Destination } from '@/src/types/DestinationInterface';

interface DestinationState {
    destinations: Destination[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    total: number;
    hasMore: boolean;
}

const initialState: DestinationState = {
    destinations: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: true,
};

// Async thunk để lấy destinations
export const getDestinations = createAsyncThunk(
    'destination/getDestinations',
    async (params?: DestinationSearchParams, { rejectWithValue }) => {
        try {
            const response: DestinationResponseInterface = await dependencies.destinationUsecase.getDestinations(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get destinations');
        }
    }
);

export const getPopularDestinations = createAsyncThunk(
    'destination/getPopularDestinations',
    async (_, { rejectWithValue }) => {
        try {
            const response: DestinationResponseInterface = await dependencies.destinationUsecase.getPopularDestinations();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get popular destinations');
        }
    }
);

const destinationSlice = createSlice({
    name: 'destination',
    initialState,
    reducers: {
        clearDestinations: (state) => {
            state.destinations = [];
            state.currentPage = 1;
            state.hasMore = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDestinations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDestinations.fulfilled, (state, action) => {
                state.loading = false;
                state.destinations = action.payload.data;
                state.error = null;
            })
            .addCase(getDestinations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Có lỗi xảy ra khi lấy danh sách địa điểm';
            })
            .addCase(getPopularDestinations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPopularDestinations.fulfilled, (state, action) => {
                state.loading = false;
                state.destinations = action.payload.data;
                state.error = null;
            })
            .addCase(getPopularDestinations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Có lỗi xảy ra khi lấy danh sách địa điểm';
            });
    },
});

export const { clearDestinations } = destinationSlice.actions;
export const destinationReducer = destinationSlice.reducer;
export default destinationSlice.reducer;