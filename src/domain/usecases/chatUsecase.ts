import { ChatRepository } from "@/src/data/repositories/chatRepository";
import { ConversationResponseInterface } from "@/src/types/ConversationResponseInterface";

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
}