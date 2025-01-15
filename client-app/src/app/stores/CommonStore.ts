import { makeAutoObservable, reaction } from "mobx";
import agent from "../api/agent";
import { Profile } from "../models/profile";
import { ServerError } from "../models/ServerError";

export default class CommonStore {

    error: ServerError | null = null;
    token: string | null = localStorage.getItem('jwt');
    appLoaded = false;
    scrollBottom = true;
    syncPages = false;
    messageCount = 0;
    firstUnreadMessageId = 0
    matchedUsers: Profile[] = [];
    unReadMessageCount = 0;
    showLabel = true;
    notificationsPageOpen = false;


    setNotificationsPageOpen = (value: boolean) => {
        this.notificationsPageOpen = value;
    }
    setShowLabel = (value: boolean) => {
        this.showLabel = value;
    }
    setFirstUnreadMessageId = (value: number) => {
        this.firstUnreadMessageId = value;
    }
    setUnReadMessageCount = (value: number) => {
        this.unReadMessageCount = value;
    }
    setMessageCount = (value: number) => {
        this.messageCount = value;
    }
    setSyncPages = (value: boolean) => {
        this.syncPages = value;
    }
    setScrollBottom = (value: boolean) => {
        this.scrollBottom = value;
    }
    setMatchedUsers = (value: Profile[]) => {
        this.matchedUsers = value;
    }
    //groups: SignalRGroup[] = [];

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.token,
            token => {
                if (token) {
                    localStorage.setItem('jwt', token)
                } else {
                    localStorage.removeItem('jwt')
                }
            }
        )
    }

    setServerError(error: ServerError) {
        this.error = error;
    }

    setToken = (token: string | null) => {
        this.token = token;
    }

    setAppLoaded = () => {
        this.appLoaded = true;
    }

    getCount = async () => {
        const count = await agent.Conversations.count();
        this.setUnReadMessageCount(count);
    }

    getFirebaseConfig = async () => {
        try {
            const firebaseConfig = await agent.Firebase.config();
            return {
                apiKey: firebaseConfig.apiKey,
                authDomain: firebaseConfig.authDomain,
                projectId: firebaseConfig.projectId,
                storageBucket: firebaseConfig.storageBucket,
                messagingSenderId: firebaseConfig.messagingSenderId,
                appId: firebaseConfig.appId,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    };


    //manageGroups = (connectionId: string, conversationId: number) => {
    //    debugger;
    //    var group = this.groups.find(x => x.conversationId === conversationId);

    //    if (group) {
    //        if (group.connectionId === connectionId)
    //            return;
    //        else
    //            group.connectionId = connectionId;
    //    }
    //    else this.groups.push(new SignalRGroup(connectionId, conversationId));
    //}

    //getGroupConnectionId = (conversationId: number) => {
    //    debugger;
    //    var group = this.groups.find(x => x.conversationId === conversationId);
    //    if (group !== undefined) {
    //        return group.connectionId;
    //    } else {
    //        return "";
    //    }
    //}
}