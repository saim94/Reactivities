import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { format } from "date-fns";
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Conversation } from "../models/conversation";
import { Message } from "../models/message";
import { MessageData } from "../models/messageData";
import { Pagination, PagingParams } from "../models/pagination";
import { User } from "../models/user";
import { store } from "./Store";

export default class ConversationStore {
    conversations: Conversation[] = [];
    selectedConversation: Conversation | null = null;
    hubConnection: HubConnection | null = null;
    loadingConversation = false;
    isSubmitting = false;
    isdeleting = false;
    shouldReconnect = true;
    inboxOpen = false;
    pagination: Pagination | null = null;
    pagingParams = new PagingParams();
    loadingMessages = false;
    loadingInitial = false;
    unReadMessageCount = 0;
    firstUnread_MessageId = 0;
    lastUnread_MessageId = 0;
    newMessage = false;
    fetchMessages = false;

    constructor() {
        makeAutoObservable(this);
    }
    setOpenInbox = (value: boolean) => {
        this.inboxOpen = value;
    }
    setIsSubmitting = (value: boolean) => {
        this.isSubmitting = value;
    }
    setIsDeleting = (value: boolean) => {
        this.isdeleting = value;
    }
    setLoadingConversation = (value: boolean) => {
        this.loadingConversation = value
    }
    setLoadingMessages = (value: boolean) => {
        this.loadingMessages = value;
    }
    setPagination = (value: Pagination) => {
        this.pagination = value;
    }
    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setNewMessage = (value: boolean) => {
        this.newMessage = value;
    }
    setFetchMessages = (value: boolean) => {
        this.fetchMessages = value;
    }



    createHubConnection = async () => {
        //debugger;
        if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
            const hubUrl = import.meta.env.VITE_Message_URL;
            this.hubConnection = new HubConnectionBuilder()
                .withUrl(hubUrl || '', {
                    accessTokenFactory: () => store.userStore.user!.token!,
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();
            this.hubConnection.serverTimeoutInMilliseconds = 100000;
            await this.hubConnection.start();
        }

        this.hubConnection.on('ReceivePreviousMessages', this.ReceivePreviousMessages);

        this.hubConnection.on('ReceiveMessage', this.ReceiveMessage);

        this.hubConnection.on('DeleteMessageStatus', this.handleDeleteMessage);

        this.hubConnection.on('UpdateMessageStatus', this.UpdateMessageStatus);

        this.hubConnection.onclose(() => {
            //console.log('OnCloseCalled');
            if (this.shouldReconnect) {
                this.createHubConnection();
            }
        });
    };

    GetMessages = async (conversationId: number) => {
        //debugger;
        //this.loadingMessages = true;
        this.setLoadingMessages(true);
        if (!this.connectionCheck)
            await this.createHubConnection();
        //this.hubConnection?.invoke(`GetMessages/${conversationId}?pageNumber="${this.pagingParams.pageNumber}"&pageSize="${this.pagingParams.pageSize}"`)
        //    .then(() => { console.log('Messages loaded'); this.loadingMessages = false })
        //    .catch((error: any) => { console.log('Error loading messages:' + error); this.loadingMessages = false; });
        const messageId = (this.selectedConversation!.messages.length > 0) ?
            this.selectedConversation!.messages[this.selectedConversation!.messages.length - 1].messageId : 0;
        this.hubConnection?.invoke(`GetMessages`, conversationId, messageId, this.pagingParams)
            .then(() => console.log('Messages loaded'))
            .catch((error: Error) => { console.log('Error loading messages:' + error); this.setLoadingMessages(false) });

    }

    ReceivePreviousMessages = (messages: Message[], pagination: Pagination) => {

        if (messages.length > 0 && messages[0].conversationId === this.selectedConversation?.conversationId) {
            runInAction(() => {
                //debugger;
                const newMessages = messages.filter(message => {
                    // Check if the message with the same ID already exists in the array
                    const exists = this.selectedConversation?.messages.some(existingMessage => existingMessage.messageId === message.messageId);
                    return !exists; // Keep the message if it doesn't already exist
                });

                newMessages.forEach((message) => {
                    message.sentAt = new Date(message.sentAt);
                    this.selectedConversation?.messages.push(message);
                });

                this.setPagination(pagination);
            });
        }
        this.setLoadingMessages(false);
        this.setNewMessage(false);
        this.setFetchMessages(true);
    }

    UpdateMessageStatus = (messageId: number) => {
        //debugger;
        if (this.selectedConversation) {
            const { messages } = this.selectedConversation || {};

            if (messages) {
                const updatedMessages = messages.map(message => {
                    if (message.messageId <= messageId && message.sender.userName === store.userStore.user?.userName) {
                        return { ...message, isRead: true };
                    }
                    return message;
                });

                this.selectedConversation.messages = updatedMessages;
            }
        }
    };

    handleDeleteMessage = (messageId: number) => {
        //debugger;

        if (messageId > 0) {
            const updatedMessages = this.selectedConversation!.messages.filter(
                (m) => m.messageId !== messageId
            );
            this.selectedConversation!.messages = updatedMessages;
            if (this.selectedConversation!.messages.length === 0) {
                this.selectedConversation!.conversationId = 0;
                this.selectedConversation!.latestMessage = new Message(0, '', new Date(), false);
                this.selectedConversation!.user1_Id = '';
                this.selectedConversation!.user2_Id = '';
                this.selectedConversation!.user1 = new User();
                this.selectedConversation!.user2 = new User();
                this.selectedConversation!.messages = [];
            }
        }
        //this.isdeleting = false;
    };

    deleteConversation = async (conversationId: number) => {
        this.isdeleting = true;
        try {
            await agent.Conversations.delete(conversationId);
            runInAction(() => {
                this.isdeleting = false;
                this.selectedConversation!.conversationId = 0;
                this.selectedConversation!.messages = [];
            })
        } catch (error) {
            console.log(error)
            runInAction(() => this.isdeleting = false)
        }
    }

    deleteMessage = async (messageId: number, method: string) => {
        this.isdeleting = true;
        if (!this.connectionCheck)
            await this.createHubConnection();
        const data = {
            messageId: messageId.toString(),
            conversationId: this.selectedConversation?.conversationId.toString(),
            method: method,
            recipient: store.profileStore.profile?.username,
        };

        this.hubConnection?.invoke('DeleteMessage', data)
            .then(() => console.log('Message deleted'))
            .catch(error => console.error('Failed to delete message:', error));
    };

    get connectionCheck() {
        return !this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected ? false : true;
    }

    updateIsRead = async (messageId: number) => {
        //if (!this.fetchMessages) {
        //console.log('called');
        if (this.newMessage) {
            const message = this.selectedConversation?.messages.find(x => x.messageId === messageId);
            message!.isRead = true;
            this.setNewMessage(false);
            //this.firstUnread_MessageId = 0;
            //this.unReadMessageCount = 0;
        } else {
            this.updateUnreadMessages(messageId);
            //this.firstUnread_MessageId = 0;
            //this.unReadMessageCount = 0;
        }
        if (!this.connectionCheck)
            await this.createHubConnection();
        const data = {
            messageId: messageId.toString(),
            conversationId: this.selectedConversation?.conversationId.toString(),
            senderName: this.selectedConversation?.messages.find(x => x.messageId === messageId)?.sender.userName,
        };
        //console.log(data);
        this.hubConnection!.invoke('UpdateIsRead', data)
            .then(() => console.log('message status updated'))
            .catch((error: Error) => {
                console.error('Failed to update message status: ', error);
            });


        //var message = this.selectedConversation?.messages.find(x => x.messageId === messageId);
        //if (this.inboxOpen && message!.sender.userName !== store.userStore.user?.userName) {
        //console.log('called');
        //var count = this.getUnReadMessageCount;
        //if (count > 1)
        //    this.unReadMessageCount = count;  ///BACK HERE
        ////var lastMessage = this.selectedConversation.messages.find(x => x.messageId === conversation.latestMessage?.messageId);
        //message!.isRead = true;

        //if (!this.connectionCheck)
        //    await this.createHubConnection(1);
        //const data = {
        //    messageId: messageId.toString(),
        //    conversationId: this.selectedConversation?.conversationId.toString()!,
        //    senderName: this.selectedConversation?.messages.find(x => x.messageId === messageId)?.sender.userName,
        //};
        //console.log(data);
        //this.hubConnection!.invoke('UpdateIsRead', data)
        //    .then(() => console.log('message status updated'))
        //    .catch((error: any) => {
        //        console.error('Failed to update message status: ', error);
        //    });
        //this.ModifyPagination('add');
        //}
        //}
        //this.setFetchMessages(false);
    }

    updateUnreadMessages = (messageId: number) => {
        this.getUnreadMessages
            .filter(message => message.messageId <= messageId && message.sender.userName !== store.userStore.user?.userName)
            .forEach(message => { message.isRead = true });
    }

    private sendMessage = (messageData: MessageData) => {
        //debugger;
        this.setIsSubmitting(true);
        this.hubConnection!.invoke('SendMessage', messageData)
            .then(() => console.log('Message sent'))
            .catch((error: Error) => {
                console.error('Failed to send message:', error);
                this.setIsSubmitting(false);
            });
    };

    send = async (messageData: MessageData) => {
        if (!this.connectionCheck)
            await this.createHubConnection();
        this.firstUnread_MessageId = 0;
        this.unReadMessageCount = 0;
        this.sendMessage(messageData);
    };

    ReceiveMessage = (conversation: Conversation) => {
        conversation.messages.forEach(con => { con.sentAt = new Date(con.sentAt) })
        conversation.latestMessage!.sentAt = new Date(conversation.latestMessage!.sentAt);
        /*if (this.inboxOpen) { debugger; conversation.latestMessage!.isRead = true; this.updateisRead(conversation.latestMessage!.messageId) }*/
        //debugger;
        runInAction(() => {
            this.setIsSubmitting(false);
            //debugger;
            if (this.selectedConversation === undefined || this.selectedConversation?.conversationId === 0) {
                this.selectedConversation = conversation;
            }
            else {
                if (conversation.conversationId === this.selectedConversation?.conversationId) {
                    this.selectedConversation?.messages.push(conversation.latestMessage!);
                    this.setNewMessage(true);
                    this.setFetchMessages(false);
                    //console.log('Inbox Open' + this.inboxOpen)
                    if (!this.inboxOpen) {
                        this.unReadMessageCount = this.getUnReadMessageCount;
                        this.firstUnread_MessageId = this.getFirstUnreadMessageId();
                    }
                    else
                        this.firstUnread_MessageId = 0;
                    //if (this.inboxOpen && conversation.latestMessage?.sender.userName !== store.userStore.user?.userName) {
                    //    console.log('called');
                    //    var lastMessage = this.selectedConversation.messages.find(x => x.messageId === conversation.latestMessage?.messageId);
                    //    lastMessage!.isRead = true;
                    //    this.updateisRead(lastMessage!.messageId);
                    //    //this.ModifyPagination('add');
                    //}
                }

            }
            this.selectedConversation!.latestMessage = null;
        });
    }

    ModifyPagination = (predicate: string) => {
        if (this.pagination) {
            (predicate === 'add') ? this.pagination.totalItems++ : this.pagination.totalItems--;
            const newTotalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
            if (newTotalPages < this.pagination.totalPages) {
                this.pagination.totalPages = newTotalPages;
                this.pagination.currentPage--;
            } else if (newTotalPages > this.pagination.totalPages) {
                this.pagination.totalPages = newTotalPages;
                this.pagination.currentPage++;
            }
        }
    }

    GetConversation = async (userName: string) => {
        this.setLoadingConversation(true);
        try {
            const result = await agent.Conversations.get(userName);
            result.data.messages.forEach(con => { con.sentAt = new Date(con.sentAt) })
            runInAction(() => {
                this.selectedConversation = result.data;
                this.createHubConnection();
                this.setPagination(result.pagination);
                this.setLoadingConversation(false);
                this.loadingInitial = true;
                this.unReadMessageCount = this.getUnReadMessageCount;
                this.firstUnread_MessageId = this.getFirstUnreadMessageId();
                //this.lastUnread_MessageId = this.getLastUnreadMessageId();
                this.setNewMessage(false);
                //this.setFetchMessages(true);
            })
        } catch (error) {
            console.log(error);
            this.setLoadingConversation(false);
        }
    }

    get getUnreadMessages() {
        //debugger;
        const currentUser = store.userStore.user?.userName;
        return this.selectedConversation?.messages
            .filter(message => message.sender.userName !== currentUser && !message.isRead)
            .reverse() || [];
    }

    get lastUnreadMessageId() {
        //debugger;
        const unreadMessages = this.getUnreadMessages;
        return unreadMessages.length > 0 ? unreadMessages[unreadMessages.length - 1].messageId : 0;
    }

    get_UnreadMessages = () => {
        const currentUser = store.userStore.user?.userName;
        return this.selectedConversation?.messages
            .filter(message => message.sender.userName !== currentUser && !message.isRead)
            .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()) || [];
    }

    getLastUnreadMessageId = () => {
        //debugger;
        const unreadMessages = this.get_UnreadMessages();
        //debugger;
        return unreadMessages.length > 0 ? unreadMessages[unreadMessages.length - 1].messageId : 0;
        //return unreadMessages.length > 0 ? unreadMessages[0].messageId : 0;
    }

    getFirstUnreadMessageId = () => {
        const unreadMessages = this.getUnreadMessages;
        return unreadMessages.length > 0 ? unreadMessages[0].messageId : 0;
    }

    get_UnReadMessageCount = () => {
        const messages = this.selectedConversation?.messages || [];
        const currentUser = store.userStore.user?.userName;

        return messages.filter(message =>
            message.sender.userName !== currentUser && !message.isRead
        ).length;
    }

    get firstUnreadMessageId() {
        //debugger;
        const unreadMessages = this.getUnreadMessages;
        return unreadMessages.length > 0 ? unreadMessages[0].messageId : 0;
    }

    get messageByDate() {
        if (this.selectedConversation && this.selectedConversation.messages)
            return Array.from(this.selectedConversation!.messages).sort((a, b) =>
                a.sentAt!.getTime() - b.sentAt!.getTime());
        else return [];
    }
    get groupedMessages() {
        return Object.entries(
            this.messageByDate.reduce((messages, message) => {
                const date = format(message.sentAt!, 'dd MMM yyyy');
                messages[date] = messages[date] ? [...messages[date], message] : [message];
                return messages;
            }, {} as { [key: string]: Message[] })
        )
    }

    get getUnReadMessageCount() {
        const messages = this.selectedConversation?.messages || [];
        const currentUser = store.userStore.user?.userName;

        return messages.filter(message =>
            message.sender.userName !== currentUser && !message.isRead
        ).length;
    }

    stopHubConnection() {
        if (this !== undefined && this.hubConnection !== null) {
            this.hubConnection!.stop()
                .then(() => {
                    this.hubConnection = null;
                    console.log('SignalR hub connection stopped.');
                })
                .catch((error: Error) => {
                    console.error('Error stopping SignalR hub connection:', error);
                });
            this.shouldReconnect = false;
        }
    }

    resetStore = () => {
        this.conversations = [];
        this.selectedConversation = null;
        this.pagination = null;
        //this.pagingParams = new PagingParams();
        if (this.hubConnection?.state === HubConnectionState.Connected)
            this.stopHubConnection();
    }

    //ReceivePreviousMessages = (messages: Message[], pagination: Pagination) => {
    //    debugger;
    //    if (messages[0].conversationId === this.selectedConversation?.conversationId) {
    //        runInAction(() => {
    //            debugger;
    //            messages.forEach((message) => {
    //                message.sentAt = new Date(message.sentAt);
    //                this.selectedConversation?.messages.push(message);
    //                this.setPagination(pagination);
    //                this.setLoadingMessages(false)
    //            });
    //        });
    //    }
    //}

    //updateisRead = async (messageId: number) => {
    //    debugger;
    //    if (!this.connectionCheck)
    //        await this.createHubConnection(1);
    //    const data = {
    //        messageId: messageId.toString(),
    //        conversationId: this.selectedConversation?.conversationId.toString()!,
    //        senderName: this.selectedConversation?.messages.find(x => x.messageId === messageId)?.sender.userName,
    //    };
    //    console.log(data);
    //    this.hubConnection!.invoke('UpdateIsRead', data)
    //        .then(() => console.log('message status updated'))
    //        .catch((error: any) => {
    //            console.error('Failed to update message status: ', error);
    //        });
    //}

    //updateisRead = async (messageId: number) => {
    //    debugger;
    //    var message = this.selectedConversation?.messages.find(x => x.messageId === messageId);
    //    if (this.inboxOpen && message!.sender.userName !== store.userStore.user?.userName) {
    //        console.log('called');
    //        var count = this.getUnReadMessageCount;
    //        if (count > 1)
    //            this.unReadMessageCount = count;  ///BACK HERE
    //        //var lastMessage = this.selectedConversation.messages.find(x => x.messageId === conversation.latestMessage?.messageId);
    //        message!.isRead = true;
    //        if (!this.connectionCheck)
    //            await this.createHubConnection(1);
    //        const data = {
    //            messageId: messageId.toString(),
    //            conversationId: this.selectedConversation?.conversationId.toString()!,
    //            senderName: this.selectedConversation?.messages.find(x => x.messageId === messageId)?.sender.userName,
    //        };
    //        console.log(data);
    //        this.hubConnection!.invoke('UpdateIsRead', data)
    //            .then(() => console.log('message status updated'))
    //            .catch((error: any) => {
    //                console.error('Failed to update message status: ', error);
    //            });
    //        //this.ModifyPagination('add');
    //    }
    //}

    //start = (hubConnection: HubConnection, conversationId: number = 0, messageData: MessageData | null = null) => {
    //    hubConnection.start()
    //        .then(() => {
    //            console.log('SignalR hub connection established.');
    //            this.shouldReconnect = true;
    //            if (messageData !== null)
    //                this.sendMessage(messageData);
    //            //else if (conversationId != null && conversationId > 0)
    //            //    this.joinConversation(conversationId);
    //            //this.sendMessage(messageData);
    //        })
    //        .catch((error: any) => {
    //            console.error('Error starting SignalR hub connection:', error);
    //        });
    //}
    //joinConversation = (conversationId: number) => {
    //    debugger;
    //    //var connectionId = store.commonStore.getGroupConnectionId(conversationId);

    //    this.hubConnection?.invoke('JoinConversation', conversationId.toString(), '')
    //        .then(() => console.log('Conversation joined'))
    //        .catch((error: any) => {
    //            console.error('Failed to Join Conversation:', error);
    //        });
    //}

    //leaveConversation = () => {
    //    debugger;
    //    var conversationId = this.selectedConversation?.conversationId;
    //    if (conversationId !== undefined && conversationId !== null && conversationId > 0)
    //        this.hubConnection?.invoke('LeaveConversation', conversationId.toString())
    //            .then(() => console.log('Conversation left'))
    //            .catch((error: any) => {
    //                console.error('Failed to leave Conversation:', error);
    //            });
    //}
    //sendMessage = (hubConnection: any, messageData: MessageData) => {
    //    debugger;
    //    hubConnection.invoke('SendMessage', messageData)
    //        .catch((error: any) => {
    //            console.error('Failed to send message:', error);
    //        });
    //};

    //getConnection = () => {
    //    const hubUrl = process.env.REACT_APP_Message_URL;
    //    var hubConnection = new HubConnectionBuilder()
    //        .withUrl((hubUrl !== undefined) ? hubUrl : '', {
    //            accessTokenFactory: () => store.userStore.user?.token!,
    //        })
    //        .withAutomaticReconnect()
    //        .configureLogging(LogLevel.Information)
    //        .build();
    //    hubConnection.serverTimeoutInMilliseconds = 100000;
    //    return hubConnection;
    //}

    // Example usage:
    //	const hubConnection = createHubConnection();

    //hubConnection.start().then(() => {
    //	// Listen for a user initiating a message
    //	document.getElementById('sendButton')?.addEventListener('click', () => {
    //		const messageData = {
    //			recipientUserName: 'JohnDoe',
    //			messageContent: 'Hello, John!',
    //		};

    //		sendMessage(hubConnection, messageData);
    //	});
    //});
}