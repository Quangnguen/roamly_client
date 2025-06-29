import { ChatRepository } from "@/src/data/repositories/chatRepository";
import { getConversationsApi } from "../api/chatApi";
import { ConversationResponseInterface } from "@/src/types/ConversationResponseInterface";

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
}