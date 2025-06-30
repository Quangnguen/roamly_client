import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dependencies } from '@/src/dependencies/dependencies';
import { ConversationResponseInterface } from '@/src/types/ConversationResponseInterface';
import { MessageResponseInterface, SendMessageRequest } from '@/src/types/messageResponseInterface';

interface ChatState {
    loading: boolean;
    messagesLoading: boolean; // Loading riêng cho messages
    error: string | null;
    conversations: ConversationResponseInterface[];
    selectedConversation: ConversationResponseInterface | null;
    messages: MessageResponseInterface[]; // Thêm state cho messages
    unreadCount: number;
    onlineUsers: string[];
    hasMoreMessages: boolean; // Flag để kiểm tra có còn messages để load không
    currentPage: number; // Trang hiện tại cho pagination
}

const initialState: ChatState = {
    loading: false,
    messagesLoading: false,
    error: null,
    conversations: [],
    selectedConversation: null,
    messages: [],
    unreadCount: 0,
    onlineUsers: [],
    hasMoreMessages: true,
    currentPage: 1
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

export const getMessages = createAsyncThunk(
    'chat/getMessages',
    async ({ conversationId, limit, before }: { conversationId: string, limit: number, before?: string }, { rejectWithValue }) => {
        try {
            const response: MessageResponseInterface[] = await dependencies.chatUsecase.getMessages(conversationId, limit, before || '');
            console.log('🔧 ChatDetailPage - Messages state updated:', {
                messagesCount: response.length,
                messagesLoading: false,
                hasMoreMessages: true,
                currentPage: 1,
                messages: response.slice(0, 3) // Log first 3 messages
            });
            return { messages: response, conversationId, isLoadMore: !!before };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get messages');
        }
    }
);

// Async thunk để gửi tin nhắn
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async (messageData: SendMessageRequest, { rejectWithValue }) => {
        try {
            const response: MessageResponseInterface = await dependencies.chatUsecase.sendMessage(
                messageData.conversationId,
                messageData.content,
                messageData.files
            );
            return response;
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
            // Reset messages khi chọn conversation mới
            state.messages = [];
            state.hasMoreMessages = true;
            state.currentPage = 1;
        },

        // Clear selected conversation
        clearSelectedConversation: (state) => {
            state.selectedConversation = null;
            state.messages = [];
            state.hasMoreMessages = true;
            state.currentPage = 1;
        },

        // Add new message to current conversation
        addMessage: (state, action: PayloadAction<MessageResponseInterface>) => {
            const newMessage = action.payload;
            // Thêm message vào cuối danh sách (newest last)
            state.messages.push(newMessage);
        },

        // Socket event handlers
        handleSocketNewMessage: (state, action) => {
            console.log('🔄 chatSlice: handleSocketNewMessage called with:', action.payload);

            const { conversationId, message } = action.payload;
            console.log('📨 chatSlice: Processing message for conversation:', conversationId);
            console.log('📨 chatSlice: Message content:', message);

            // Find conversation and update lastMessage
            const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
            console.log('📨 chatSlice: Found conversation at index:', conversationIndex);

            if (conversationIndex !== -1) {
                const oldLastMessage = state.conversations[conversationIndex].lastMessage;
                const newLastMessage = message.content || message.text || "Tin nhắn mới";

                state.conversations[conversationIndex].lastMessage = newLastMessage;
                console.log('📨 chatSlice: Updated lastMessage from', oldLastMessage, 'to', newLastMessage);

                // Move conversation to top of list
                const conversation = state.conversations[conversationIndex];
                state.conversations.splice(conversationIndex, 1);
                state.conversations.unshift(conversation);
                console.log('📨 chatSlice: Moved conversation to top');
            }

            // Update selected conversation if it matches
            if (state.selectedConversation?.id === conversationId) {
                console.log('📨 chatSlice: Updating selected conversation and adding message to list');
                state.selectedConversation!.lastMessage = message.content || message.text || "Tin nhắn mới";
                // Add message to current messages list
                state.messages.push(message);
                console.log('📨 chatSlice: Total messages now:', state.messages.length);
            }

            // Increment unread count if not current conversation
            if (state.selectedConversation?.id !== conversationId) {
                state.unreadCount += 1;
                console.log('📨 chatSlice: Incremented unread count to:', state.unreadCount);
            }

            console.log('✅ chatSlice: handleSocketNewMessage completed');
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
            state.messages = [];
            state.unreadCount = 0;
            state.onlineUsers = [];
            state.hasMoreMessages = true;
            state.currentPage = 1;
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

            // Get messages
            .addCase(getMessages.pending, (state) => {
                state.messagesLoading = true;
                state.error = null;
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.messagesLoading = false;
                const { messages, isLoadMore } = action.payload;

                if (isLoadMore) {
                    // Prepend older messages to the beginning of the list
                    state.messages = [...messages, ...state.messages];
                    state.currentPage += 1;
                } else {
                    // Replace with new messages (first load)
                    state.messages = messages;
                    state.currentPage = 1;
                }

                // Check if we have more messages to load
                state.hasMoreMessages = messages.length > 0;
                state.error = null;
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.messagesLoading = false;
                state.error = action.payload as string || action.error.message || 'Có lỗi xảy ra khi lấy tin nhắn';
            })

            // Send message
            .addCase(sendMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false;
                const newMessage = action.payload;

                // Thêm message mới vào cuối danh sách messages
                state.messages.push(newMessage);

                // Cập nhật lastMessage của conversation hiện tại
                if (state.selectedConversation) {
                    state.selectedConversation.lastMessage = newMessage.content || "Tin nhắn mới";

                    // Cập nhật conversation trong danh sách
                    const conversationIndex = state.conversations.findIndex(
                        conv => conv.id === state.selectedConversation?.id
                    );
                    if (conversationIndex !== -1) {
                        state.conversations[conversationIndex].lastMessage = newMessage.content || "Tin nhắn mới";
                        // Move conversation to top
                        const conversation = state.conversations[conversationIndex];
                        state.conversations.splice(conversationIndex, 1);
                        state.conversations.unshift(conversation);
                    }
                }

                state.error = null;
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
    addMessage,
    handleSocketNewMessage,
    handleSocketUserOnline,
    handleSocketUserOffline,
    handleSocketTyping,
    resetUnreadCount,
    clearChatState
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
