import { User } from "./user";

export interface AppNotification {
    notificationId: string;
    content: string;
    createdDate: Date | null;
    title: string;
    isRead: boolean;
    user: User;
    userId: string;
    sourceUser: User;
    sourceUserId: string;
    activityId: string;
}

//export interface IAppNotification {
//    id: number;
//    notificationId: string;
//    content: string;
//    createdDate: Date | null;
//    title: string;
//    isRead: boolean;
//    isCanceled: boolean;
//    user: Profile;
//    userId: string;
//}
//export class AppNotification implements IAppNotification {

//    id: number;
//    notificationId: string;
//    content: string;
//    createdDate: Date | null;
//    title: string;
//    isRead: boolean;
//    isCanceled: boolean;
//    user: Profile;
//    userId: string;

//}