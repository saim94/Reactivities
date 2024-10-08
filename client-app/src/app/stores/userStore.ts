import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { PagingParams } from "../models/pagination";
import { User, UserFormValues } from "../models/user";
import { router } from "../router/Routes";
import { store } from "./Store";

export default class UserStore {
    user: User | null = null;
    fbLoading = false;
    //appLoading = false;
    //refreshTokenTimeout: any;
    refreshTokenTimeout: NodeJS.Timeout | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn() {
        return !!this.user;
    }

    //setAppLoading = (value: boolean) => {
    //    this.appLoading = value;
    //}

    login = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.login(creds);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);
            store.notificationStore.getNotifications(new PagingParams(1, 5, store.notificationStore.newNotificationsCount), false);
            store.notificationStore.getUnreadNotificationsCount();
            router.navigate('/activities');
            store.modalStore.closeModal();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.register(creds);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => this.user = user);
            router.navigate('/activities');
            store.notificationStore.getNotifications(new PagingParams(1, 5, store.notificationStore.newNotificationsCount), false);
            store.notificationStore.getUnreadNotificationsCount();
            store.modalStore.closeModal();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    logout = () => {
        store.commonStore.setToken(null);
        store.activityStore.resetStore();
        store.commentStore.resetStore();
        store.conversationStore.resetConversationStore();
        store.profileStore.resetProfileStore();
        this.user = null;
        router.navigate('/')
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            store.commonStore.setToken(user.token);
            runInAction(() => this.user = user);
            store.notificationStore.getNotifications(new PagingParams(1, 5, store.notificationStore.newNotificationsCount), false);
            store.notificationStore.getUnreadNotificationsCount();
            this.startRefreshTokenTimer(user);

            let lastVisitedlocString = localStorage.getItem('lastVisitedlocation');
            lastVisitedlocString = (lastVisitedlocString && !lastVisitedlocString.includes('object')) ? lastVisitedlocString : '';
            if (lastVisitedlocString !== '') {
                //const locationObject: LocationObj = JSON.parse(lastVisitedlocString);

                const wasPageRefreshed = localStorage.getItem('pageRefreshed');

                if (!!wasPageRefreshed && lastVisitedlocString) {
                    router.navigate(lastVisitedlocString);
                    //this.setAppLoading(true);
                    //this.appLoading = true;
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    setImage = (image: string) => {
        if (this.user) this.user.image = image;
    }

    //setDisplayname = (displayName: string) => {
    //    if (this.user)
    //        this.user.displayName = displayName;
    //}

    setDisplayName = (name: string) => {
        if (this.user) this.user.displayName = name;
    }

    facebookLogin = async (accessTaken: string) => {
        try {
            this.fbLoading = true;
            const user = await agent.Account.fbLogin(accessTaken);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
            runInAction(() => {
                this.user = user;
                this.fbLoading = false;
            })
            router.navigate('/activities')
        } catch (error) {
            console.log(error);
            runInAction(() => this.fbLoading = false)
        }
    }

    refreshToken = async () => {
        this.stopRefreshTokenTimer();
        try {
            const user = await agent.Account.refreshToken();
            runInAction(() => this.user = user);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
        } catch (error) {
            console.log(error);
        }
    }

    //private startRefreshTokenTimer(user: User) {
    //    const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
    //    const expires = new Date(jwtToken.exp * 1000);
    //    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    //    this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    //}

    private startRefreshTokenTimer(user: User) {
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    }

    private stopRefreshTokenTimer() {
        if (this.refreshTokenTimeout !== null) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null; // Reset the timeout property after clearing it.
        }
    }


}