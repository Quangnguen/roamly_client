import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dependencies } from '@/src/dependencies/dependencies';
import { ConversationResponseInterface } from '@/src/types/ConversationResponseInterface';

interface ChatState {
    loading: boolean;
    error: string | null;
    conversations: ConversationResponseInterface[];
    selectedConversation: ConversationResponseInterface | null;
    unreadCount: number;
    onlineUsers: string[];
}

const initialState: ChatState = {
    loading: false,
    error: null,
    conversations: [],
    selectedConversation: null,
    unreadCount: 0,
    onlineUsers: []
};

// Async thunk để lấy danh sách conversations
export const getConversations = createAsyncThunk(
    'chat/getConversations',
    async (_, { rejectWithValue }) => {
        try {
            const response: ConversationResponseInterface[] = await dependencies.chatUsecase.getConversations();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get conversations');
        }
    }
);

// Async thunk để gửi tin nhắn (sẽ implement sau)
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async (messageData: { conversationId: string; content: string }, { rejectWithValue }) => {
        try {
            // TODO: Implement sendMessageApi
            // const response = await sendMessageApi(messageData);
            return messageData;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to send message');
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // Set selected conversation
        setSelectedConversation: (state, action: PayloadAction<ConversationResponseInterface | null>) => {
            state.selectedConversation = action.payload;
        },

        // Clear selected conversation
        clearSelectedConversation: (state) => {
            state.selectedConversation = null;
        },

        // Socket event handlers
        handleSocketNewMessage: (state, action) => {
            const { conversationId, message } = action.payload;

            // Find conversation and update lastMessage
            const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
            if (conversationIndex !== -1) {
                state.conversations[conversationIndex].lastMessage = message.content || message.text || "Tin nhắn mới";
                // Move conversation to top of list
                const conversation = state.conversations[conversationIndex];
                state.conversations.splice(conversationIndex, 1);
                state.conversations.unshift(conversation);
            }

            // Update selected conversation if it matches
            if (state.selectedConversation?.id === conversationId) {
                state.selectedConversation!.lastMessage = message.content || message.text || "Tin nhắn mới";
            }

            // Increment unread count if not current conversation
            if (state.selectedConversation?.id !== conversationId) {
                state.unreadCount += 1;
            }
        },

        handleSocketUserOnline: (state, action) => {
            const { userId } = action.payload;
            if (!state.onlineUsers.includes(userId)) {
                state.onlineUsers.push(userId);
            }
        },

        handleSocketUserOffline: (state, action) => {
            const { userId } = action.payload;
            state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
        },

        handleSocketTyping: (state, action) => {
            const { conversationId, userId, isTyping } = action.payload;
            // TODO: Implement typing indicator logic
        },

        // Reset unread count
        resetUnreadCount: (state) => {
            state.unreadCount = 0;
        },

        // Clear chat state
        clearChatState: (state) => {
            state.conversations = [];
            state.selectedConversation = null;
            state.unreadCount = 0;
            state.onlineUsers = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get conversations
            .addCase(getConversations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload;
                state.error = null;
            })
            .addCase(getConversations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Có lỗi xảy ra khi lấy danh sách cuộc trò chuyện';
            })

            // Send message
            .addCase(sendMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false;
                // Message will be handled by socket event
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Có lỗi xảy ra khi gửi tin nhắn';
            });
    }
});

// Export actions
export const {
    setSelectedConversation,
    clearSelectedConversation,
    handleSocketNewMessage,
    handleSocketUserOnline,
    handleSocketUserOffline,
    handleSocketTyping,
    resetUnreadCount,
    clearChatState
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
