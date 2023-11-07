export class MessageData implements IMessageData {
    constructor(messageContent: string, recipientUserName: string, connectionId: string) {
        this.messageContent = messageContent;
        this.recipientUserName = recipientUserName;
        this.connectionId = connectionId
    }
    recipientUserName: string;
    messageContent: string;
    connectionId: string;
}


export interface IMessageData {
    recipientUserName: string;
    messageContent: string;
    connectionId: string;
}