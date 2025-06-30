import { ChatRepository } from "@/src/data/repositories/chatRepository";
import { ConversationResponseInterface, CreateConversationRequest } from "@/src/types/ConversationResponseInterface";
import { MessageResponseInterface } from "@/src/types/messageResponseInterface";

export class ChatUsecase {
    constructor(private chatRepository: ChatRepository) { }

    async getConversations(): Promise<ConversationResponseInterface[]> {
        try {
            const response = await this.chatRepository.getConversations();
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getMessages(conversationId: string, limit: number, before: string): Promise<MessageResponseInterface[]> {
        try {
            const response = await this.chatRepository.getMessages(conversationId, limit, before);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async sendMessage(conversationId: string, content: string, files?: any[]): Promise<MessageResponseInterface> {
        try {
            const response = await this.chatRepository.sendMessage(conversationId, content, files);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async createConversation(request: CreateConversationRequest): Promise<ConversationResponseInterface> {
        try {
            const response = await this.chatRepository.createConversation(request);
            return response;
        } catch (error) {
            throw error;
        }
    }
}