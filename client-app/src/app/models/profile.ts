import { User } from "./user";

export interface IProfile {
    id:string
    username: string,
    userName: string,
    displayName: string,
    image?: string,
    bio?: string,
    followersCount: number,
    followingCount: number,
    unreadMessageCount: number,
    following: boolean,
    photos?: Photo[]
}

export class Profile implements IProfile {
    constructor(user: User) {
        this.id = user.id
        this.username = user.userName;
        this.displayName = user.displayName;
        this.image = user.image;
        this.userName = user.userName
    }
    id: string;
    username: string;
    userName: string;
    displayName: string;
    image?: string;
    bio?: string;
    followersCount = 0;
    followingCount = 0;
    unreadMessageCount = 0;
    following = false;
    photos?: Photo[]
}

export interface Photo {
    id: string;
    url: string;
    isMain: boolean
}

export interface UserActivity {
    id: string,
    title: string,
    category: string,
    date: Date
}