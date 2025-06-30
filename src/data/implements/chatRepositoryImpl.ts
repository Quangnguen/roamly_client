import { ChatRepository } from "@/src/data/repositories/chatRepository";
import { getConversationsApi, getMessagesApi, sendMessageApi, createConversationApi } from "../api/chatApi";
import { ConversationResponseInterface, CreateConversationRequest } from "@/src/types/ConversationResponseInterface";
import { MessageResponseInterface } from "@/src/types/messageResponseInterface";

export class ChatRepositoryImpl implements ChatRepository {
    async getConversations(): Promise<ConversationResponseInterface[]> {
        try {
            const response = await getConversationsApi();
            // Extract data array giống như followRepositoryImpl
            return response.data;
        } catch (error) {
            throw new Error('Failed to get conversations');
        }
    }

    async getMessages(conversationId: string, limit: number, before: string): Promise<MessageResponseInterface[]> {
        try {
            const response = await getMessagesApi(conversationId, limit, before);
            return response.data;
        } catch (error) {
            throw new Error('Failed to get messages');
        }
    }

    async sendMessage(conversationId: string, content: string, files?: any[]): Promise<MessageResponseInterface> {
        try {
            const response = await sendMessageApi(conversationId, content, files);
            return response.data;
        } catch (error) {
            throw new Error('Failed to send message');
        }
    }

    async createConversation(request: CreateConversationRequest): Promise<ConversationResponseInterface> {
        try {
            const response = await createConversationApi(request);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create conversation');
        }
    }
}