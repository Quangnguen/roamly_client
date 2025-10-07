import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationUsecase } from '@/src/domain/usecases/notificationUsecase';
import { NotificationRepositoryImpl } from '@/src/data/implements/notificationRepositoryImpl';
import { ResponseInterface } from '@/src/types/ResponseInterface';

// Define interfaces
export interface Notification {
    id: string;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'MESSAGE';
    message: string;
    isRead: boolean;
    senderId: string;
    recipientId: string;
    postId: string | null;
    sharedPostId: string | null;
    data: any | null;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        profilePic: string | null;
    };
    post?: {
        id: string;
        imageUrl: string[];
    };
}

interface NotificationsApiResponse extends ResponseInterface<Notification[]> { }

// Initialize NotificationUseCase with NotificationRepositoryImpl
const notificationUseCase = new NotificationUsecase(new NotificationRepositoryImpl());

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk<NotificationsApiResponse, void>(
    'notification/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationUseCase.getNotifications();
            return response as unknown as NotificationsApiResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải thông báo');
        }
    }
);

export const markNotificationAsRead = createAsyncThunk<ResponseInterface<void>, string>(
    'notification/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await notificationUseCase.markAsRead(notificationId);
            return response as unknown as ResponseInterface<void>;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi đánh dấu đã đọc thông báo');
        }
    }
);


// Create slice
const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        notifications: [] as Notification[],
        loading: false,
        error: null as string | null,
        message: null as string | null,
        status: null as 'success' | 'error' | null,
        unreadCount: 0,
    },
    reducers: {
        clearMessage: (state) => {
            state.message = null;
            state.status = null;
        },
        markAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(notification => {
                notification.isRead = true;
            });
            state.unreadCount = 0;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.data;
                state.error = null;
                state.unreadCount = action.payload.data.filter(n => !n.isRead).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            });
    },
});

// Export actions
export const {
    clearMessage,
    markAllAsRead,
    markAsRead,
    addNotification
} = notificationSlice.actions;

// Export reducer
export default notificationSlice.reducer;
