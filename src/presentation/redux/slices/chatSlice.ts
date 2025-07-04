import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dependencies } from '@/src/dependencies/dependencies';
import { ConversationResponseInterface, CreateConversationRequest } from '@/src/types/ConversationResponseInterface';
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

// Async thunk để tạo cuộc trò chuyện mới
export const createConversation = createAsyncThunk(
    'chat/createConversation',
    async (request: CreateConversationRequest, { rejectWithValue }) => {
        try {
            const response: ConversationResponseInterface = await dependencies.chatUsecase.createConversation(request);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create conversation');
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
            // Kiểm tra xem message đã tồn tại chưa
            const existingMessageIndex = state.messages.findIndex(msg => msg.id === newMessage.id);
            if (existingMessageIndex === -1) {
                // Chỉ thêm message nếu chưa tồn tại
                state.messages.push(newMessage);
            }
        },

        // Add optimistic message (hiển thị ngay khi gửi)
        addOptimisticMessage: (state, action: PayloadAction<MessageResponseInterface>) => {
            const optimisticMessage = action.payload;
            state.messages.push(optimisticMessage);
        },

        // Update message status khi có response
        updateMessageStatus: (state, action: PayloadAction<{ tempId: string; message?: MessageResponseInterface; status: 'sent' | 'failed' }>) => {
            const { tempId, message, status } = action.payload;
            const messageIndex = state.messages.findIndex(msg => msg.tempId === tempId);

            if (messageIndex !== -1) {
                if (status === 'sent' && message) {
                    // Thay thế message tạm thời bằng message thực từ server
                    state.messages[messageIndex] = {
                        ...message,
                        sendingStatus: 'sent'
                    };
                } else if (status === 'failed') {
                    // Cập nhật trạng thái thất bại
                    state.messages[messageIndex].sendingStatus = 'failed';
                }
            }
        },

        // Socket event handlers
        handleSocketNewMessage: (state, action) => {
            const { conversationId, message } = action.payload;

            // Find conversation and update lastMessage
            const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);

            if (conversationIndex !== -1) {
                // ✅ Lưu toàn bộ Message object thay vì chỉ content
                state.conversations[conversationIndex].lastMessage = {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    content: message.content || message.text || "Tin nhắn mới",
                    createdAt: message.createdAt || new Date().toISOString(),
                    updatedAt: message.updatedAt || new Date().toISOString(),
                    deletedForAll: message.deletedForAll || false,
                    seenBy: message.seenBy || [],
                    mediaUrls: message.mediaUrls || [],
                    mediaType: message.mediaType || undefined,
                    pinned: message.pinned || false,
                    sender: message.sender
                };

                // Move conversation to top of list
                const conversation = state.conversations[conversationIndex];
                state.conversations.splice(conversationIndex, 1);
                state.conversations.unshift(conversation);
            }

            // Update selected conversation if it matches
            if (state.selectedConversation?.id === conversationId) {
                // ✅ Lưu toàn bộ Message object cho selected conversation
                state.selectedConversation!.lastMessage = {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    content: message.content || message.text || "Tin nhắn mới",
                    createdAt: message.createdAt || new Date().toISOString(),
                    updatedAt: message.updatedAt || new Date().toISOString(),
                    deletedForAll: message.deletedForAll || false,
                    seenBy: message.seenBy || [],
                    mediaUrls: message.mediaUrls || [],
                    mediaType: message.mediaType || undefined,
                    pinned: message.pinned || false,
                    sender: message.sender
                };

                // Add message to current messages list chỉ nếu chưa tồn tại
                const existingMessageIndex = state.messages.findIndex(msg => msg.id === message.id);
                if (existingMessageIndex === -1) {
                    state.messages.push(message);
                }
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

                // Sort conversations by lastMessage time (newest first)
                const sortedConversations = [...action.payload].sort((a, b) => {
                    // Get last message time for conversation A
                    let aTime = '';
                    if (a.lastMessage && typeof a.lastMessage === 'object') {
                        aTime = a.lastMessage.createdAt || a.lastMessage.updatedAt || '';
                    }
                    if (!aTime) {
                        aTime = a.updatedAt || a.createdAt || '0';
                    }

                    // Get last message time for conversation B
                    let bTime = '';
                    if (b.lastMessage && typeof b.lastMessage === 'object') {
                        bTime = b.lastMessage.createdAt || b.lastMessage.updatedAt || '';
                    }
                    if (!bTime) {
                        bTime = b.updatedAt || b.createdAt || '0';
                    }

                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                });

                state.conversations = sortedConversations;
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

                // Không thêm message ở đây nữa vì đã có optimistic update
                // Message sẽ được cập nhật qua updateMessageStatus action

                // Cập nhật lastMessage của conversation hiện tại
                if (state.selectedConversation) {
                    // ✅ Lưu toàn bộ Message object
                    state.selectedConversation.lastMessage = {
                        id: newMessage.id,
                        conversationId: newMessage.conversationId,
                        senderId: newMessage.senderId,
                        content: newMessage.content || "Tin nhắn mới",
                        createdAt: newMessage.createdAt,
                        updatedAt: newMessage.updatedAt,
                        deletedForAll: newMessage.deletedForAll || false,
                        seenBy: newMessage.seenBy || [],
                        mediaUrls: newMessage.mediaUrls || [],
                        mediaType: newMessage.mediaType || undefined,
                        pinned: newMessage.pinned || false,
                        sender: newMessage.sender
                    };

                    // Cập nhật conversation trong danh sách
                    const conversationIndex = state.conversations.findIndex(
                        conv => conv.id === state.selectedConversation?.id
                    );
                    if (conversationIndex !== -1) {
                        // ✅ Lưu toàn bộ Message object
                        state.conversations[conversationIndex].lastMessage = {
                            id: newMessage.id,
                            conversationId: newMessage.conversationId,
                            senderId: newMessage.senderId,
                            content: newMessage.content || "Tin nhắn mới",
                            createdAt: newMessage.createdAt,
                            updatedAt: newMessage.updatedAt,
                            deletedForAll: newMessage.deletedForAll || false,
                            seenBy: newMessage.seenBy || [],
                            mediaUrls: newMessage.mediaUrls || [],
                            mediaType: newMessage.mediaType || undefined,
                            pinned: newMessage.pinned || false,
                            sender: newMessage.sender
                        };
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
            })

            // Create conversation
            .addCase(createConversation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createConversation.fulfilled, (state, action) => {
                state.loading = false;
                const newConversation = action.payload;

                // Thêm conversation mới vào đầu danh sách
                state.conversations.unshift(newConversation);
                state.error = null;
            })
            .addCase(createConversation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Có lỗi xảy ra khi tạo cuộc trò chuyện';
            });
    }
});

// Export actions
export const {
    setSelectedConversation,
    clearSelectedConversation,
    addMessage,
    addOptimisticMessage,
    updateMessageStatus,
    handleSocketNewMessage,
    handleSocketUserOnline,
    handleSocketUserOffline,
    handleSocketTyping,
    resetUnreadCount,
    clearChatState
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
