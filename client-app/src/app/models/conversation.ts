import { ChatMessage } from "./chatMessage";
import { User } from "./user";

export interface Conversation {
    conversationId: number;
    currentUserId: string;
    currentUser: User;
    otherUserId: string;
    otherUser: User;
    messages: ChatMessage[];
    unreadMessageCount: number;
    firstUnreadMessageId: number;
    //latestMessage: ChatMessage | null;
}