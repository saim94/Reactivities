import { Message } from "./message";
import { User } from "./user";

export interface Conversation {
    conversationId: number;
    user1_Id: string;
    user1: User;
    user2_Id: string;
    user2: User;
    messages: Message[];
    latestMessage: Message | null;
}