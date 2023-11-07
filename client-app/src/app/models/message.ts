import { User } from "./user"

export interface IMessage {
    messageId: number;
    sender: User;
    content: string;
    sentAt: Date;
    isRead: boolean;
    conversationId: number
    //'User1Deleted': boolean;
    //'User2Deleted': boolean;
}

export class Message implements IMessage {
    constructor(messageId: number, content: string, sentAt: Date, isRead: boolean) {
        this.messageId = messageId;
        this.content = content;
        this.sentAt = sentAt;
        this.isRead = isRead;
    }
    messageId: number;
    sender: User = new User();
    content: string;
    sentAt: Date;
    isRead: boolean;
    conversationId = 0;
}