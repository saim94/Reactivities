export interface IUser {
    username: string,
    userName: string,
    displayName: string,
    token: string,
    image?: string
}

export class User implements IUser {
    constructor() {
        this.username = '';
        this.userName = '';
        this.displayName = '';
        this.image = '';
        this.token = '';
    }
    username: string
    userName: string
    displayName: string
    token: string
    image?: string
}

export interface UserFormValues {
    email: string,
    password: string,
    displayName?: string,
    username?: string,
    userName?: string,
}