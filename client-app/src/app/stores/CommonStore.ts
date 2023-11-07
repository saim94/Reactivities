import { makeAutoObservable, reaction } from "mobx";
import { ServerError } from "../models/ServerError";

export default class CommonStore {
    error: ServerError | null = null;
    token: string | null = localStorage.getItem('jwt');
    appLoaded = false;
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