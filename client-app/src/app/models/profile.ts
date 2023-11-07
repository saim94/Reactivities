import { User } from "./user";

export interface IProfile {
    username: string,
    userName: string,
    displayName: string,
    image?: string,
    bio?: string,
    followersCount: number,
    followingCount: number,
    following: boolean,
    photos?: Photo[]
}

export class Profile implements IProfile {
    constructor(user: User) {
        this.username = user.userName;
        this.displayName = user.displayName;
        this.image = user.image;
        this.userName = user.userName
    }

    username: string;
    userName: string;
    displayName: string;
    image?: string;
    bio?: string;
    followersCount = 0;
    followingCount = 0;
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