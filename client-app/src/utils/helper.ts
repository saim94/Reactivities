import { runInAction } from "mobx";
import { Conversation } from "../app/models/conversation";

export default function GetUnreadMessageCount(currentUserUserName: string, conversation: Conversation) {
    return conversation.messages.filter(message =>
        message.sender.userName !== currentUserUserName && !message.isRead
    ).length;

}

export function GetFirstUnreadMessageId(currentUserUserName: string, conversation: Conversation) {

    //const unReadMessages = conversation.messages.filter(message =>
    //    message.sender.userName !== currentUserUserName && !message.isRead
    //);
    //const unReadMessages = conversation.messages.filter(message =>
    //    message.sender.userName !== currentUserUserName && !message.isRead
    //);
    const unReadMessages = conversation.messages.filter(message => message.sender.userName !== currentUserUserName && !message.isRead)
    return (unReadMessages.length === 0) ? 0 : unReadMessages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())[0].messageId;
}

export function FindConversation(conversations: Conversation[], conversationId: number) {
    const existingConversationIndex = conversations.findIndex(conv => conv.conversationId === conversationId);
    return (existingConversationIndex !== -1) ? conversations[existingConversationIndex] : null;
}

export function FindConversationByUserName(conversations: Conversation[], otherUserName: string) {
    const existingConversationIndex = conversations.findIndex(conv => conv.otherUser.userName === otherUserName);
    return (existingConversationIndex !== -1) ? conversations[existingConversationIndex] : null;
}

export function FindConversationIdByUserName(conversations: Conversation[], otherUserName: string) {
    const existingConversationIndex = conversations.findIndex(conv => conv.otherUser.userName === otherUserName);
    return (existingConversationIndex !== -1) ? conversations[existingConversationIndex].conversationId : existingConversationIndex;
}

export function FindConversationIdByUserId(conversations: Conversation[], id: string) {
    const existingConversationIndex = conversations.findIndex(conv => conv.otherUser.id === id);
    return (existingConversationIndex !== -1) ? conversations[existingConversationIndex].conversationId : existingConversationIndex;
}

export function ConcatenateConversations(newConversations: Conversation[], conversations: Conversation[]) {
    newConversations.forEach((newConversation) => {
        const existingConversation = conversations.find(
            (existingConv) => existingConv.conversationId === newConversation.conversationId
        );

        if (!existingConversation) {
            conversations.push(newConversation);
        } else {
            existingConversation.messages = [...existingConversation.messages, ...newConversation.messages];
        }
    });
}

export function ConcatenateConversations_V2(newConversations: Conversation[], conversations: Conversation[]) {
    newConversations.forEach((newConversation) => {
        const existingConversationIndex = conversations.findIndex(
            (existingConv) => existingConv.conversationId === newConversation.conversationId
        );

        if (existingConversationIndex === -1) {
            // Conversation does not exist, add it with all messages
            conversations.push(newConversation);
        } else {
            // Conversation already exists, check and add new messages
            const existingConversation = conversations[existingConversationIndex];

            newConversation.messages.forEach((newMessage) => {
                // Check if the message already exists in the conversation
                const messageExists = existingConversation.messages.some(
                    (existingMessage) => existingMessage.messageId === newMessage.messageId
                );

                // If the message doesn't exist, add it to the conversation
                if (!messageExists) {
                    existingConversation.messages.push(newMessage);
                }
            });

            // Update the existing conversation in the array
            conversations[existingConversationIndex] = existingConversation;
        }
    });
}

export function ArrangeConversationsByLatestMessage(conversations: Conversation[]) {
    runInAction(() => {
        conversations.sort((conv1, conv2) => {
            const latestMessageId1 = conv1.messages.length > 0 ? conv1.messages[conv1.messages.length - 1].messageId : 0;
            const latestMessageId2 = conv2.messages.length > 0 ? conv2.messages[conv2.messages.length - 1].messageId : 0;

            // Sort in descending order based on messageId
            return latestMessageId2 - latestMessageId1;
        });
    });
}

