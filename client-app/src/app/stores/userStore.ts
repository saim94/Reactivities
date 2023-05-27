import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { User, UserFormValues } from "../models/user";
import { router } from "../router/Routes";
import { store } from "./Store";

export default class UserStore {
    user: User | null = null;
    fbLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn() {
        return !!this.user;
    }

    login = async (creds: UserFormValues) => {
        try {
            debugger;
            const user = await agent.Account.login(creds);
            store.commonStore.setToken(user.token);
            runInAction(() => this.user = user);
            console.log(this.user);
            router.navigate('/activities');
            store.modalStore.closeModal();
        } catch (error) {
            throw error;
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.register(creds);
            store.commonStore.setToken(user.token);
            runInAction(() => this.user = user);
            router.navigate('/activities');
            store.modalStore.closeModal();
        } catch (error) {
            throw error;
        }
    }

    logout = () => {
        store.commonStore.setToken(null);
        this.user = null;
        router.navigate('/')
    }

    getUser = async () => {
        //debugger
        try {
            const user = await agent.Account.current();
            runInAction(() => this.user = user);
            debugger;
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
}