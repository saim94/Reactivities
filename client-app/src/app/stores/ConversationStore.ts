import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { format } from "date-fns";
import { makeAutoObservable, runInAction } from "mobx";
import { ArrangeConversationsByLatestMessage, ConcatenateConversations_V2, FindConversation, FindConversationByUserName } from "../../utils/helper";
import agent from "../api/agent";
import { ChatMessage } from "../models/chatMessage";
import { Conversation } from "../models/conversation";
import { MessageData } from "../models/messageData";
import { Pagination, PagingParams } from "../models/pagination";
import { Profile } from "../models/profile";
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
    paginationConversation: Pagination | null = null;
    pagingParams = new PagingParams(1, 10);
    pagingParamsConversation = new PagingParams(1, 10);
    loadingMessages = false;
    loadingConversations = false;
    loadingInitial = false;
    unReadMessageCount = 0;
    firstUnread_MessageId = 0;
    lastUnread_MessageId = 0;
    newMessage = false;

    constructor() {
        makeAutoObservable(this);
    }

    setSelectedConversation = (value: Conversation | null) => {
        runInAction(() => {
            this.selectedConversation = value;
        })
    }

    setUnReadMessageCount = (value: number) => {
        this.unReadMessageCount = value;
    }
    setFirstUnread_MessageId = (value: number) => {
        this.firstUnread_MessageId = value;
    }

    setFirstUnread_MessageIdCalBack = (value: number) => {
        this.firstUnread_MessageId = value;
        return this.firstUnread_MessageId;
    }

    setUnReadMessageCountCalBack = (value: number) => {
        this.unReadMessageCount = value;
        return this.unReadMessageCount;
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
    setPagingParamsConversation = (pagingParams: PagingParams) => {
        this.pagingParamsConversation = pagingParams;
    }
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setNewMessage = (value: boolean) => {
        this.newMessage = value;
    }
    setLoadingConversations = (value: boolean) => {
        this.loadingConversations = value;
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

        this.hubConnection.on('ReceiveMatchedUsers', this.ReceiveMatchedUsers);

        this.hubConnection.onclose(() => {
            if (this.shouldReconnect) {
                this.createHubConnection();
            }
        });
    };

    GetMessages = async (conversationId: number, pageSize?: number) => {

        this.setLoadingMessages(true);
        if (!this.connectionCheck)
            await this.createHubConnection();

        if (pageSize) this.pagingParams.pageSize = pageSize;
        this.hubConnection?.invoke(`GetMessages`, conversationId, this.pagingParams)
            //.then(() => /*console.log('Messages loaded')*/ this.setLoadingMessages(false))
            .catch((error: Error) => { console.log('Error loading messages:' + error); this.setLoadingMessages(false) });
    }

    ReceivePreviousMessages = (messages: ChatMessage[], pagination: Pagination) => {

        runInAction(() => {
            if (messages.length > 0 && messages[0].conversationId === this.selectedConversation?.conversationId) {
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
            }
            this.setLoadingMessages(false);
            this.setNewMessage(false);
        });


    }

    UpdateMessageStatus = (messageId: number) => {
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

        const existingConversation = this.findConversationByMessageId(messageId);
        if (existingConversation) {
            const { messages } = existingConversation || {};

            if (messages) {
                const updatedMessages = messages.map(message => {
                    if (message.messageId <= messageId && message.sender.userName === store.userStore.user?.userName) {
                        return { ...message, isRead: true };
                    }
                    return message;
                });
                existingConversation.messages = updatedMessages;
            }
        }
    };

    handleDeleteMessage = (messageId: number) => {
        if (messageId > 0) {
            if (this.selectedConversation) {
                const updatedMessages = this.selectedConversation!.messages.filter(
                    (m) => m.messageId !== messageId
                );
                this.selectedConversation!.messages = updatedMessages;
                if (this.selectedConversation!.messages.length === 0) {
                    this.resetConversation(this.selectedConversation!);
                }
            }
            // Check if the conversation already exists in the conversations array
            const existingConversation = this.findConversationByMessageId(messageId);

            if (existingConversation) {
                // Conversation already exists, update it with the latest message
                const updatedMessages = existingConversation.messages.filter(
                    (m) => m.messageId !== messageId
                );
                existingConversation.messages = updatedMessages;
                if (existingConversation.messages.length === 0) {
                    this.resetConversation(existingConversation);
                }
            }

        }

    };

    findConversationByMessageId = (messageId: number): Conversation | undefined => {
        for (const conversation of this.conversations) {
            const foundMessage = conversation.messages.find(msg => msg.messageId === messageId);
            if (foundMessage) {
                return conversation;
            }
        }

        return undefined;
    };


    deleteConversation = async (conversationId: number) => {
        this.isdeleting = true;
        try {
            await agent.Conversations.delete(conversationId);
            runInAction(() => {
                this.isdeleting = false;
                if (this.selectedConversation && this.selectedConversation.conversationId === conversationId) {
                    this.selectedConversation.messages = [];
                }

                const existingConversation = FindConversation(this.conversations, conversationId);
                if (existingConversation) {
                    existingConversation.messages = [];
                }
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
            //.then(() => console.log('Message deleted'))
            .catch(error => console.error('Failed to delete message:', error));
    };

    get connectionCheck() {
        return !this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected ? false : true;
    }

    updateIsRead = async (messageId: number) => {
        //if (this.newMessage) {
        //    const message = this.selectedConversation?.messages.find(x => x.messageId === messageId);
        //    if (message) {
        //        message!.isRead = true;
        //    }

        //    this.setNewMessage(false);
        //    runInAction(() => {
        //        debugger;
        //        if (this.selectedConversation) {
        //            this.selectedConversation.firstUnreadMessageId = 0;
        //            this.selectedConversation.unreadMessageCount = 0;
        //        }
        //    })


        //    //this.setFirstUnread_MessageIdCalBack(0);
        //} else {
        this.updateUnreadMessages(messageId);
        //}
        if (!this.connectionCheck)
            await this.createHubConnection();

        const data = {
            messageId: messageId.toString(),
            conversationId: this.selectedConversation?.conversationId.toString(),
            senderName: this.selectedConversation?.messages.find(x => x.messageId === messageId)?.sender.userName,
        };
        this.updateMessageStatus(data);
    }

    updateMessageStatus = (data: { messageId: string, conversationId: string | undefined, senderName: string | undefined }) => {
        this.hubConnection!.invoke('UpdateIsRead', data)
            //.then(() => console.log('message status updated'))
            .catch((error: Error) => {
                console.error('Failed to update message status: ', error);
            });
    }

    updateUnreadMessages = (messageId: number) => {
        const messages = this.getUnreadMessages
            .filter(message => message.messageId <= messageId && message.sender.userName !== store.userStore.user?.userName);
        store.commonStore.setUnReadMessageCount(store.commonStore.unReadMessageCount - messages.length);
        messages.forEach(message => { message.isRead = true });
    }

    private sendMessage = (messageData: MessageData) => {
        this.setIsSubmitting(true);
        this.hubConnection!.invoke('SendMessage', messageData)
            //.then(() => console.log('Message sent'))
            .catch((error: Error) => {
                console.error('Failed to send message:', error);
                this.setIsSubmitting(false);
            });
    };

    send = async (messageData: MessageData) => {
        
        messageData.recipientUserName = (this.selectedConversation?.otherUser.userName) ? this.selectedConversation?.otherUser.userName : '';
        if (!this.connectionCheck)
            await this.createHubConnection();
        runInAction(() => {
            this.firstUnread_MessageId = 0;
            this.unReadMessageCount = 0;
            this.sendMessage(messageData);
        })
    };



    ReceiveMessage = (message: ChatMessage) => {
        message.sentAt = new Date(message.sentAt);
        runInAction(() => {
            this.setNewMessage(true);
            this.setIsSubmitting(false);
            if (!this.selectedConversation || this.selectedConversation?.conversationId === 0) {
                this.selectedConversation = this.CreateConversation(message, (store.userStore.user) ? store.userStore.user : new User());
            }
            else {
                if (message.conversationId === this.selectedConversation?.conversationId) {
                    this.selectedConversation?.messages.push(message);
                    if (this.inboxOpen && message.sender.userName !== store.userStore.user?.userName) {
                        this.selectedConversation.unreadMessageCount++;
                        if (this.selectedConversation.firstUnreadMessageId === 0) {
                            this.selectedConversation.firstUnreadMessageId = message.messageId
                        }
                        message.isRead = true;
                        const data = {
                            messageId: message.messageId.toString(),
                            conversationId: this.selectedConversation?.conversationId.toString(),
                            senderName: this.selectedConversation?.messages.find(x => x.messageId === message.messageId)?.sender.userName,
                        };
                        this.updateMessageStatus(data);
                    }
                    if (message.sender.userName !== store.userStore.user?.userName)
                        store.commonStore.unReadMessageCount++;
                    this.setNewMessage(false);
                }
            }
            // Check if the conversation already exists in the conversations array
            let existingConversation = FindConversation(this.conversations, message.conversationId);

            if (!existingConversation) existingConversation = FindConversationByUserName(this.conversations, message.sender.userName);

            if (existingConversation) {
                const existingMessageIndex = existingConversation.messages.findIndex(
                    msg => msg.messageId === message.messageId
                );

                if (existingMessageIndex === -1) {
                    // Message doesn't exist, add it
                    existingConversation.messages.push(message);
                    existingConversation.unreadMessageCount++;
                    if (existingConversation.firstUnreadMessageId === 0) {
                        existingConversation.firstUnreadMessageId = message.messageId
                    }
                }
                ArrangeConversationsByLatestMessage(this.conversations);
                // Conversation already exists, update it with the latest message
            }
            else
                this.conversations.push(this.CreateConversation(message, (store.userStore.user) ? store.userStore.user : new User()));
        });
    }

    CreateConversation = (message: ChatMessage, loggendInUser: User) => {
        const current_User: User = { ...loggendInUser };

        const existingconversation = FindConversation(this.conversations, message.conversationId);//find is conversation already exists

        if (existingconversation)
            return existingconversation;

        const conversation: Conversation = {
            conversationId: message.conversationId,
            currentUser: current_User,
            currentUserId: current_User.id,
            messages: [message],
            otherUser: message.sender,
            otherUserId: message.sender.id,
            unreadMessageCount: 0,
            firstUnreadMessageId: 0
        };

        return conversation;
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
            result.messages.forEach(con => { con.sentAt = new Date(con.sentAt) })
            runInAction(() => {
                this.selectedConversation = result;
                this.createHubConnection();
                this.setLoadingConversation(false);
                this.loadingInitial = true;
                this.unReadMessageCount = this.getUnReadMessageCount;
                this.firstUnread_MessageId = this.getfirstUnreadMessageId;
                this.setNewMessage(false);
            })
        } catch (error) {
            console.log(error);
            this.setLoadingConversation(false);
        }
    }

    listConversations = async (id?: string) => {
        if (this.pagingParamsConversation.pageNumber < 2)
            this.setLoadingInitial(true);
        else
            this.setLoadingConversations(true);
        try {
            if (!id) id = '';

            const result = await agent.Conversations.list(id, this.pagingParamsConversation);
            result.data.forEach(c => c.messages.forEach(m => { m.sentAt = new Date(m.sentAt) }));
            runInAction(() => {
                ArrangeConversationsByLatestMessage(result.data);
                ConcatenateConversations_V2(result.data, this.conversations);
                this.paginationConversation = result.pagination;
                if (result.data.length === 0 && this.selectedConversation?.conversationId === 0) {
                    this.selectedConversation = null;
                }

                this.setLoadingInitial(false);
                this.setLoadingConversations(false);
            })
        } catch (error) {
            console.log(error);
            this.setLoadingInitial(false);
            this.setLoadingConversations(false);
        }
    }

    get getUnreadMessages() {
        const currentUser = store.userStore.user?.userName;
        return this.selectedConversation?.messages
            .filter(message => message.sender.userName !== currentUser && !message.isRead).
            sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()) || [];
    }

    get lastUnreadMessageId() {
        const unreadMessages = this.getUnreadMessages;
        return unreadMessages.length > 0 ? unreadMessages[0].messageId : 0;
    }

    get_UnreadMessages = () => {
        const currentUser = store.userStore.user?.userName;
        return this.selectedConversation?.messages
            .filter(message => message.sender.userName !== currentUser && !message.isRead)
            .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()) || [];
    }

    getLastUnreadMessageId = () => {
        const unreadMessages = this.get_UnreadMessages();
        return unreadMessages.length > 0 ? unreadMessages[unreadMessages.length - 1].messageId : 0;
    }

    get_UnReadMessageCount = () => {
        const messages = this.selectedConversation?.messages || [];
        const currentUser = store.userStore.user?.userName;

        return messages.filter(message =>
            message.sender.userName !== currentUser && !message.isRead
        ).length;
    }

    get getfirstUnreadMessageId() {
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
            }, {} as { [key: string]: ChatMessage[] })
        )
    }

    get getUnReadMessageCount() {
        const messages = this.selectedConversation?.messages || [];
        const currentUser = store.userStore.user?.userName;

        return messages.filter(message =>
            message.sender.userName !== currentUser && !message.isRead
        ).length;
    }

    Search = async (searchQuery: string) => {
        if (!this.connectionCheck)
            await this.createHubConnection();
        this.hubConnection?.invoke('SearchUsers', searchQuery)
            .catch((error: Error) => console.log(error));
    }

    ReceiveMatchedUsers = (newUsers: Profile[]) => {

        if (newUsers.length === 0) {
            // If the newUsers array is empty, reset the matchedUsers array in CommonStore
            store.commonStore.matchedUsers = [];
        } else {
            store.commonStore.matchedUsers = newUsers;
        }
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

    emptyconversations = () => {
        this.conversations = [];
        this.pagingParamsConversation = new PagingParams(1, 10);
        this.paginationConversation = null;
    }

    resetConversationStore = () => {
        this.emptyconversations();
        this.selectedConversation = null;
        this.pagination = null;
        this.paginationConversation = null;
        this.conversations = []
        if (this.hubConnection?.state === HubConnectionState.Connected)
            this.stopHubConnection();
    }

    resetConversation = (conversation: Conversation) => {
        //conversation!.conversationId = 0;
        //conversation!.latestMessage = new ChatMessage(0, '', new Date(), false);
        //conversation!.user1_Id = '';
        //conversation!.user2_Id = '';
        //conversation!.user1 = new User();
        //conversation!.user2 = new User();
        conversation!.messages = [];
    }


    //emptyTempConversation = () => {
    //    //debugger;
    //    if (this.tempConversation && this.tempConversation.conversationId === 0) {
    //        this.tempConversation = {
    //            conversationId: -1, currentUser: new User, otherUser: new User(),
    //            currentUserId: '', otherUserId: '', messages: []
    //        }
    //    }
    //    //this.tempConversation = null;
    //}

    //ReceiveMessage = (conversation: Conversation) => {
    //    //console.log('MessageReceived ' + conversation.latestMessage?.conversationId);
    //    conversation.messages.forEach(con => { con.sentAt = new Date(con.sentAt) });
    //    //conversation.latestMessage!.sentAt = new Date(conversation.latestMessage!.sentAt);
    //    runInAction(() => {

    //        this.setIsSubmitting(false);
    //        //debugger
    //        if (!this.selectedConversation || this.selectedConversation?.conversationId === 0) {
    //            this.selectedConversation = conversation;
    //        }
    //        else {
    //            if (conversation.conversationId === this.selectedConversation?.conversationId) {
    //                this.selectedConversation?.messages.push(conversation.messages[0]);
    //                this.setNewMessage(true);
    //                //if (!this.inboxOpen) {
    //                //this.setFirstUnread_MessageId(0);
    //                //this.setUnReadMessageCount(0);
    //                //this.unReadMessageCount = 0;
    //                //this.firstUnread_MessageId = 0;
    //                //}
    //                //else
    //                //    this.firstUnread_MessageId = 0;
    //            }
    //        }
    //        //debugger;
    //        // Check if the conversation already exists in the conversations array
    //        let existingConversation = FindConversation(this.conversations, conversation.conversationId);

    //        if (existingConversation) {
    //            const existingMessageIndex = existingConversation.messages.findIndex(
    //                msg => msg.messageId === conversation.messages[0].messageId
    //            );

    //            if (existingMessageIndex === -1) {
    //                // Message doesn't exist, add it
    //                existingConversation.messages.push(conversation.messages[0]);
    //            }
    //            // Conversation already exists, update it with the latest message
    //            /*existingConversation.messages.push(conversation.latestMessage!)*/
    //        }
    //        else
    //            this.conversations.push(conversation);
    //        // Clear latestMessage for selectedConversation
    //        //this.selectedConversation!.latestMessage = null;
    //    });
    //}

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
    //ReceiveMessage = (conversation: Conversation) => {
    //    conversation.messages.forEach(con => { con.sentAt = new Date(con.sentAt) })
    //    conversation.latestMessage!.sentAt = new Date(conversation.latestMessage!.sentAt);
    //    //debugger;
    //    runInAction(() => {
    //        this.setIsSubmitting(false);
    //        //debugger;
    //        if (this.selectedConversation === undefined || this.selectedConversation?.conversationId === 0) {
    //            this.selectedConversation = conversation;
    //        }
    //        else {
    //            if (conversation.conversationId === this.selectedConversation?.conversationId) {
    //                this.selectedConversation?.messages.push(conversation.latestMessage!);
    //                this.setNewMessage(true);
    //                this.setFetchMessages(false);
    //                if (!this.inboxOpen) {
    //                    this.unReadMessageCount = this.getUnReadMessageCount;
    //                    this.firstUnread_MessageId = this.getFirstUnreadMessageId();
    //                }
    //                else
    //                    this.firstUnread_MessageId = 0;
    //            }

    //        }
    //        this.selectedConversation!.latestMessage = null;
    //    });
    //}
}