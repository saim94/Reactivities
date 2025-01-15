import { makeAutoObservable } from "mobx";

export interface IUser {
    id: string,
    username: string,
    userName: string,
    displayName: string,
    token: string,
    image?: string,
    emails: Email[],
    phones: Phone[],
    getPrimaryEmail: () => Email | null
    getEmail(emailId: number): Email | null
    getPrimaryPhone: () => Phone | null
    getPhone(phoneId: number): Phone | null
    //email:string 
}

export class User implements IUser {

    constructor(user?: IUser) {
        this.id = user?.id || '';
        this.username = user?.username || '';
        this.userName = user?.userName || '';
        this.displayName = user?.displayName || '';
        this.token = user?.token || '';
        this.image = user?.image || '';
        this.emails = user?.emails || [];
        this.phones = user?.phones || [];
        makeAutoObservable(this);
    }

    id: string;
    username: string;
    userName: string;
    displayName: string;
    token: string;
    image?: string;
    emails: Email[];
    phones: Phone[];
    // Method to return the primary email
    getPrimaryEmail(): Email | null {
        const primaryEmail = this.emails.find(email => email.isPrimary);
        return primaryEmail ? primaryEmail : null;
    }

    getEmail(emailId: number): Email | null {
        return this.emails.find(e => e.id === emailId) || null;
    }

    getPrimaryPhone(): Phone | null {
        const primaryPhone = this.phones.find(phone => phone.isPrimary);
        return primaryPhone ? primaryPhone : null;
    }

    getPhone(phoneId: number): Phone | null {
        return this.phones.find(e => e.id === phoneId) || null;
    }
}

export interface UserFormValues {
    email: string,
    password: string,
    displayName?: string,
    username?: string,
    userName?: string,
}

export interface Email {
    id: number,
    email: string,
    isPrimary: boolean,
    isVerified: boolean
}

export interface Phone {
    id: number,
    number: string,
    isPrimary: boolean,
    isVerified: boolean
}