import { ConversationResponseInterface } from "@/src/types/ConversationResponseInterface";

export interface ChatRepository {
    getConversations(): Promise<ConversationResponseInterface[]>;
}