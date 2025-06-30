import { ConversationResponseInterface } from "@/src/types/ConversationResponseInterface";
import { MessageResponseInterface } from "@/src/types/messageResponseInterface";

export interface ChatRepository {
    getConversations(): Promise<ConversationResponseInterface[]>;
    getMessages(conversationId: string, limit: number, before: string): Promise<MessageResponseInterface[]>;
    sendMessage(conversationId: string, content: string, files?: any[]): Promise<MessageResponseInterface>;
}