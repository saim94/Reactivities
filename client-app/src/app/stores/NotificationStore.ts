import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { IsUnRead } from "../../utils/helper";
import agent from "../api/agent";
import { AppNotification } from "../models/appNotification";
import { ChatComment } from "../models/comment";
import { Pagination, PagingParams } from "../models/pagination";
import { store } from "./Store";

export default class NotificationStore {

    hubConnection: HubConnection | null = null;
    shouldReconnect = true;
    loading = false;
    loadingInitial = false;
    newNotificationsCount = 0;
    notifications: AppNotification[] | null = [];
    unreadNotificationsCount = 0;


    pagination: Pagination | null = null;
    pagingParams = new PagingParams(1, 5);


    constructor() {
        makeAutoObservable(this);
    }
    setPagingParams = (value: PagingParams) => {
        this.pagingParams = value;
    }
    setPagingParamsFunc = (value: PagingParams) => {
        //const newPagingParams = new PagingParams(prevPagingParams.pageNumber + 1, 5);
        this.pagingParams = value;
        return value;
    };
    setLoading = (value: boolean) => {
        this.loading = value;
    }
    createHubConnection = async () => {
        if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
            const hubUrl = import.meta.env.VITE_Notification_URL;
            this.hubConnection = new HubConnectionBuilder()
                .withUrl(hubUrl || '', {
                    accessTokenFactory: () => store.userStore.user!.token!,
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();
            this.hubConnection.serverTimeoutInMilliseconds = 100000;
            await this.hubConnection.start().then(() => console.log('Notification Hub Started'));
        }

        this.hubConnection.on('ReceiveNotifications', this.ReceiveNotifications);

        this.hubConnection.onclose(() => {
            if (this.shouldReconnect) {
                this.createHubConnection();
            }
        });
    };

    ReceiveNotifications = (notifications: AppNotification[] | null, notification: AppNotification | null) => {
        // Check if notifications is not null and it's not a duplicate
        if (notifications && this.notifications && !this.isNotificationsDuplicate(notifications)) {
            this.notifications.unshift(...notifications);
            this.newNotificationsCount += notifications.length;
            this.unreadNotificationsCount += notifications.length;
            //toast.success(notifications[0].sourceUser.displayName + " " + notifications[0].content, {
            //    progressClassName: 'toast-progress', // Custom class for the progress bar
            //    autoClose: 5000, // Auto close the toast after 5000 milliseconds (5 seconds)
            //    closeButton: true, // Show close button on the toast
            //    closeOnClick: true // Close the toast when clicked
            //});
            toast.info(notifications[0].sourceUser.displayName + " " + notifications[0].content, {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }

        // Check if notification is not null and it's not a duplicate
        if (notification && this.notifications && !this.isNotificationDuplicate(notification)) {
            this.notifications.unshift(notification);
            this.newNotificationsCount++;
            this.unreadNotificationsCount++;
            toast.info(notification.sourceUser.displayName + " " + notification.content, {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    }

    // Function to check if any of the received notifications are already present in this.notifications
    isNotificationsDuplicate(newNotifications: AppNotification[]): boolean {
        return newNotifications.some(newNotification => this.isNotificationDuplicate(newNotification));
    }

    // Function to check if a single notification is already present in this.notifications
    isNotificationDuplicate(newNotification: AppNotification): boolean {
        return this.notifications!.some(notification => this.areNotificationsEqual(notification, newNotification));
    }

    // Function to compare two notifications for equality
    areNotificationsEqual(notification1: AppNotification, notification2: AppNotification): boolean {
        return notification1.notificationId === notification2.notificationId;
        // Adjust the comparison logic as needed
    }


    checkAndConnect = async () => {
        if (!this.connectionCheck && this.hubConnection && this.hubConnection.state !== HubConnectionState.Connecting)
            await this.createHubConnection();
    }


    get connectionCheck() {
        //return !this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected ? false : true;
        if (this.hubConnection && this.hubConnection?.state === HubConnectionState.Connected)
            return true;
        else
            return false;
    }

    stopHubConnection() {
        if (this !== undefined && this.hubConnection !== null) {
            this.hubConnection!.stop()
                .then(() => {
                    this.hubConnection = null;
                    console.log('Notification hub connection stopped.');
                })
                .catch((error: Error) => {
                    console.error('Error stopping Notification hub connection:', error);
                });
            this.shouldReconnect = false;
        }
    }

    updateActivityNotification = async (notifications: AppNotification[], activityId: string) => {

        if (!this.connectionCheck)
            await this.createHubConnection();
        this.hubConnection?.invoke('UpdateActivityNotification', notifications, activityId)
            .catch((error: Error) => console.log(error));
    }

    createActivityNotification = async (notification: AppNotification) => {

        if (!this.connectionCheck)
            await this.createHubConnection();
        this.hubConnection?.invoke('CreateActivityNotification', notification)
            .catch((error: Error) => console.log(error));
    }

    cancelScheduleNotification = async (notification: AppNotification, activityId: string) => {
        const notifications: AppNotification[] = []
        notifications.push(notification);
        if (!this.connectionCheck)
            await this.createHubConnection();
        this.hubConnection?.invoke('UpdateActivityNotification', notifications, activityId)
            .catch((error: Error) => console.log(error));
    }

    activityAttendNotification = async (notification: AppNotification) => {
        if (!this.connectionCheck)
            await this.createHubConnection();
        this.hubConnection?.invoke('CreateActivityNotification', notification)
            .catch((error: Error) => console.log(error));
    }

    followNotification = async (notification: AppNotification) => {
        if (!this.connectionCheck)
            await this.createHubConnection();
        this.hubConnection?.invoke('FollowNotification', notification)
            .catch((error: Error) => console.log(error));
    }

    commentNotification = async (comment: ChatComment) => {
        if (!this.connectionCheck)
            await this.createHubConnection();
        this.hubConnection?.invoke('CommentNotification', comment)
            .catch((error: Error) => console.log(error));
    }

    getNotifications = async (params: PagingParams, unRead: boolean, buttonClick: boolean = false) => {

        if (params.pageNumber === 1 && !buttonClick)
            this.loadingInitial = true;
        else
            this.loading = true;
        //if (this.notifications!.length <= 5)
        //    this.loadingInitial = true;
        //else
        //    this.loading = true;

        try {
            const result = await agent.Notifications.list(params, unRead);
            this.newNotificationsCount = 0;
            runInAction(() => {
                if (result.data.length > 0) {
                    const newNotifications = result.data.filter(notification => !this.isNotificationDuplicate(notification));
                    this.notifications = this.notifications ? this.notifications.concat(newNotifications) : newNotifications;
                    this.pagination = result.pagination;
                }
                this.loading = false;
                this.loadingInitial = false;
            })
        } catch (error) {
            console.log(error);
            this.loading = false;
            this.loadingInitial = false;
        }
    }

    getUnreadNotificationsCount = async () => {
        try {
            const count = await agent.Notifications.unreadNotificationsCount();
            runInAction(() => {
                this.unreadNotificationsCount = count;
            });
        } catch (error) {
            console.log(error);
        }
    }

    //getNotifications_V1 = async (params: PagingParams, unRead: boolean, pageNumber: number) => {
    //    debugger

    //    if (pageNumber === 1)
    //        this.loadingInitial = true;
    //    else
    //        this.loading = true;
    //    //if (this.notifications!.length <= 5)
    //    //    this.loadingInitial = true;
    //    //else
    //    //    this.loading = true;

    //    try {
    //        var result = await agent.Notifications.list(params, unRead);
    //        this.newNotificationsCount = 0;
    //        runInAction(() => {
    //            debugger
    //            const newNotifications = result.data.filter(notification => !this.isNotificationDuplicate(notification));
    //            this.notifications = this.notifications ? this.notifications.concat(newNotifications) : newNotifications;
    //            this.pagination = result.pagination;
    //            this.loading = false;
    //            this.loadingInitial = false;
    //        })
    //    } catch (error) {
    //        console.log(error);
    //        this.loading = false;
    //        this.loadingInitial = false;
    //    }
    //}

    markAsread = async () => {
        await agent.Notifications.markAsread();
        this.unreadNotificationsCount = 0;
    }

    removeNotification = async (notificationId: string) => {
        try {
            await agent.Notifications.removeNotification(notificationId);
            runInAction(() => {
                this.notifications = this.notifications!.filter(notification => notification.notificationId !== notificationId);
                //IsUnRead(this.notifications, notificationId) &&
                //    this.unreadNotificationsCount--;
                if (IsUnRead(this.notifications, notificationId)) {
                    this.unreadNotificationsCount--;
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    readNotification = async (notificationId: string) => {
        try {
            await agent.Notifications.readNotification(notificationId);
            runInAction(() => {
                const index = this.notifications!.findIndex(notification => notification.notificationId === notificationId);
                if (index !== -1) {
                    this.notifications![index].isRead = true;
                    this.unreadNotificationsCount--;
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    resetNotifications = () => {
        this.notifications = [];
    }
}