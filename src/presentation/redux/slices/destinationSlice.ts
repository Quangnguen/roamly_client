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
    searchResults: Destination[];
    searchLoading: boolean;
    searchError: string | null;
    searchPagination: {
        page: number;
        total: number;
        totalPages: number;
        limit: number;
    } | null;
    myDestinations: Destination[]; // Local copy for user's favorites - modify this directly
    favoriteLoading: boolean;
    favoriteError: string | null;
    destinationDetail: Destination | null;
    destinationDetailLoading: boolean;
    destinationDetailError: string | null;
    userDestinations: Destination[]; // <-- added: destinations by user id
    userDestLoading: boolean;
    userDestError: string | null;
}

const initialState: DestinationState = {
    destinations: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: true,
    searchResults: [],
    searchLoading: false,
    searchError: null,
    searchPagination: null,
    myDestinations: [], // Local copy for user's favorites
    favoriteLoading: false,
    favoriteError: null,
    destinationDetail: null,
    destinationDetailLoading: false,
    destinationDetailError: null,
    userDestinations: [], // <-- added
    userDestLoading: false,
    userDestError: null,
};

// Async thunk để lấy destinations
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

export const getFavoriteDestinations = createAsyncThunk(
    'destination/getFavoriteDestinations',
    async (_, { rejectWithValue }) => {
        try {
            const response: DestinationResponseInterface = await dependencies.destinationUsecase.getFavoriteDestinations();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get favorite destinations');
        }
    }
);

// <-- new thunk: lấy destinations theo user id (API: /destinations/user/:id)
export const getDestinationsByUser = createAsyncThunk(
    'destination/getDestinationsByUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            // Assumes destinationUsecase has getDestinationsByUser(userId)
            const response: DestinationResponseInterface = await dependencies.destinationUsecase.getDestinationsByUser(userId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get destinations by user');
        }
    }
);

export const toggleFavoriteDestination = createAsyncThunk(
    'destination/toggleFavoriteDestination',
    async ({ targetId, type }: { targetId: string, type: string }, { rejectWithValue }) => {
        try {
            const response: any = await dependencies.destinationUsecase.toggleFavoriteDestination(targetId, type);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to toggle favorite destination');
        }
    }
);

export const untoggleFavoriteDestination = createAsyncThunk(
    'destination/untoggleFavoriteDestination',
    async ({ targetId, type }: { targetId: string, type: string }, { rejectWithValue }) => {
        try {
            const response: any = await dependencies.destinationUsecase.untoggleFavoriteDestination(targetId, type);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to untoggle favorite destination');
        }
    }
);

export const searchDestinations = createAsyncThunk(
    'destination/searchDestinations',
    async ({ params }: { params: DestinationSearchParams }, { rejectWithValue }) => {
        try {
            const response: DestinationResponseInterface = await dependencies.destinationUsecase.searchDestinations(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to search destinations');
        }
    }
);

export const getDestinationById = createAsyncThunk(
    'destination/getDestinationById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response: DestinationResponseInterface = await dependencies.destinationUsecase.getDestinationById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get destination details');
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
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchPagination = null;
            state.searchError = null;
        },
        clearDestinationDetail: (state) => {
            state.destinationDetail = null;
            state.destinationDetailError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPopularDestinations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPopularDestinations.fulfilled, (state, action) => {
                state.loading = false;
                // Handle Destination[], DestinationData, or single Destination
                if (Array.isArray(action.payload.data)) {
                    state.destinations = action.payload.data;
                } else if ('destinations' in action.payload.data) {
                    // DestinationData format
                    state.destinations = action.payload.data.destinations || [];
                } else {
                    // Single Destination - wrap in array or handle differently
                    state.destinations = [action.payload.data as Destination];
                }
                state.error = null;
            })
            .addCase(getPopularDestinations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Có lỗi xảy ra khi lấy danh sách địa điểm';
            })
            .addCase(getFavoriteDestinations.pending, (state) => {
                state.favoriteLoading = true;
                state.favoriteError = null;
            })
            .addCase(getFavoriteDestinations.fulfilled, (state, action) => {
                state.favoriteLoading = false;
                // API returns Destination[] directly - store as local copy
                if (Array.isArray(action.payload.data)) {
                    state.myDestinations = action.payload.data;
                } else {
                    // Fallback in case response format changes
                    state.myDestinations = [];
                }
                state.favoriteError = null;
            })
            .addCase(getFavoriteDestinations.rejected, (state, action) => {
                state.favoriteLoading = false;
                state.favoriteError = action.payload as string || 'Có lỗi xảy ra khi lấy danh sách địa điểm yêu thích';
            })
            // <-- handlers for getDestinationsByUser
            .addCase(getDestinationsByUser.pending, (state) => {
                state.userDestLoading = true;
                state.userDestError = null;
            })
            .addCase(getDestinationsByUser.fulfilled, (state, action) => {
                state.userDestLoading = false;
                // Handle Destination[], DestinationData, or single Destination
                if (Array.isArray(action.payload.data)) {
                    state.userDestinations = action.payload.data;
                } else if ('destinations' in action.payload.data) {
                    state.userDestinations = action.payload.data.destinations || [];
                } else if (action.payload.data && typeof action.payload.data === 'object' && 'id' in action.payload.data) {
                    state.userDestinations = [action.payload.data as Destination];
                } else {
                    state.userDestinations = [];
                }
                state.userDestError = null;
            })
            .addCase(getDestinationsByUser.rejected, (state, action) => {
                state.userDestLoading = false;
                state.userDestError = action.payload as string || 'Có lỗi xảy ra khi lấy địa điểm của người dùng';
            })
            .addCase(toggleFavoriteDestination.pending, (state) => {
                // Không set loading = true để tránh re-render không cần thiết
                state.error = null;
            })
            .addCase(toggleFavoriteDestination.fulfilled, (state, action) => {
                // Update destination in both destinations and searchResults arrays
                const updateDestination = (destination: any) => {
                    if (destination) {
                        destination.likeCount += 1;
                        destination.isLiked = true;
                    }
                };

                // Update in destinations array (popular)
                const destination = state.destinations.find(d => d.id === action.meta.arg.targetId);
                updateDestination(destination);

                // Update in searchResults array (search results)
                const searchResult = state.searchResults.find(d => d.id === action.meta.arg.targetId);
                updateDestination(searchResult);

                // Add to myDestinations if not already present
                const myDestIndex = state.myDestinations.findIndex(d => d.id === action.meta.arg.targetId);
                if (myDestIndex === -1) {
                    // Find the updated destination to add to favorites
                    const updatedDestination = destination || searchResult;
                    if (updatedDestination) {
                        state.myDestinations.push(updatedDestination);
                    }
                } else {
                    // Update existing favorite destination
                    updateDestination(state.myDestinations[myDestIndex]);
                }

                // Also update userDestinations if present
                const userDest = state.userDestinations.find(d => d.id === action.meta.arg.targetId);
                updateDestination(userDest);
            })
            .addCase(toggleFavoriteDestination.rejected, (state, action) => {
                // Có thể hiển thị error toast thay vì set error state
                console.error('Toggle favorite failed:', action.payload);
            })
            .addCase(untoggleFavoriteDestination.pending, (state) => {
                // Không set loading = true để tránh re-render không cần thiết
                state.error = null;
            })
            .addCase(untoggleFavoriteDestination.fulfilled, (state, action) => {
                // Update destination in both destinations and searchResults arrays
                const updateDestination = (destination: any) => {
                    if (destination && destination.likeCount > 0) {
                        destination.likeCount -= 1;
                        destination.isLiked = false;
                    }
                };

                // Update in destinations array (popular)
                const destination = state.destinations.find(d => d.id === action.meta.arg.targetId);
                updateDestination(destination);

                // Update in searchResults array (search results)
                const searchResult = state.searchResults.find(d => d.id === action.meta.arg.targetId);
                updateDestination(searchResult);

                // Remove from myDestinations - Direct modification
                const myDestIndex = state.myDestinations.findIndex(d => d.id === action.meta.arg.targetId);
                if (myDestIndex !== -1) {
                    state.myDestinations.splice(myDestIndex, 1);
                }

                // Also update/remove from userDestinations if present
                const userIndex = state.userDestinations.findIndex(d => d.id === action.meta.arg.targetId);
                if (userIndex !== -1) {
                    state.userDestinations.splice(userIndex, 1);
                }
            })
            .addCase(untoggleFavoriteDestination.rejected, (state, action) => {
                // Có thể hiển thị error toast thay vì set error state
                console.error('Untoggle favorite failed:', action.payload);
            })
            .addCase(searchDestinations.pending, (state) => {
                state.searchLoading = true;
                state.error = null;
            })
            .addCase(searchDestinations.fulfilled, (state, action) => {
                state.searchLoading = false;
                // Handle both old format (Destination[]) and new format (DestinationData)
                if (Array.isArray(action.payload.data)) {
                    // Old format: data is Destination[]
                    state.searchResults = action.payload.data;
                    state.searchPagination = null;
                } else if ('destinations' in action.payload.data && 'pagination' in action.payload.data) {
                    // New format: data is DestinationData
                    state.searchResults = action.payload.data.destinations || [];
                    state.searchPagination = action.payload.data.pagination;
                } else {
                    // Fallback: single Destination object (shouldn't happen for search)
                    state.searchResults = [];
                    state.searchPagination = null;
                }
                state.error = null;
            })
            .addCase(searchDestinations.rejected, (state, action) => {
                state.searchLoading = false;
                state.error = action.payload as string || 'Có lỗi xảy ra khi tìm kiếm địa điểm';
            })
            .addCase(getDestinationById.pending, (state) => {
                state.destinationDetailLoading = true;
                state.destinationDetailError = null;
            })
            .addCase(getDestinationById.fulfilled, (state, action) => {
                state.destinationDetailLoading = false;
                // Handle single destination object
                if (!Array.isArray(action.payload.data) && typeof action.payload.data === 'object' && 'id' in action.payload.data) {
                    state.destinationDetail = action.payload.data as Destination;
                }
                state.destinationDetailError = null;
            })
            .addCase(getDestinationById.rejected, (state, action) => {
                state.destinationDetailLoading = false;
                state.destinationDetailError = action.payload as string || 'Có lỗi xảy ra khi tải chi tiết địa điểm';
            });
    },
});

export const { clearDestinations, clearSearchResults, clearDestinationDetail } = destinationSlice.actions;
export const destinationReducer = destinationSlice.reducer;
export default destinationSlice.reducer;