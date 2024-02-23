export interface IUser {
    id: string,
    username: string,
    userName: string,
    displayName: string,
    token: string,
    image?: string
}

export class User implements IUser {
    constructor() {
        this.id = ''
        this.username = '';
        this.userName = '';
        this.displayName = '';
        this.image = '';
        this.token = '';
    }
    id: string
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