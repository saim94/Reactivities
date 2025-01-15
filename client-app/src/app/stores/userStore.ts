import { isAxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import agent from "../api/agent";
import { PagingParams } from "../models/pagination";
import { PasswordUpdateValues } from "../models/passwordUpdate";
import { User, UserFormValues } from "../models/user";
import { router } from "../router/Routes";
import { store } from "./Store";

export default class UserStore {
    user: User | null = null;
    fbLoading = false;
    //appLoading = false;
    //refreshTokenTimeout: any;
    refreshTokenTimeout: NodeJS.Timeout | null = null;
    isSubmitting = false;

    setIsSubmitting = (value: boolean) => {
        this.isSubmitting = value;
    }

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn() {
        return !!this.user;
    }

    //setAppLoading = (value: boolean) => {
    //    this.appLoading = value;
    //}

    resetPassword = async (creds: PasswordUpdateValues) => {
        try {
            await agent.Account.resetPassword(creds);
            toast.success('Password reset successfully. ');
            return 'Password reset successfully. ';
        } catch (error: unknown) {
            if (Array.isArray(error) && error[0] === 'Invalid token.') {
                error[0] = 'Token missing or expired, please try again!';
                toast.error(error[0] as string)
                throw error[0];
            }
            else {
                console.log('Problem updating password, please try again')
                throw 'Problem updating password, please try again';
            }
        }
    }

    sendVerificationCode = async (email: string | null = null) => {
        if (!email && this.user) email = this.user.getPrimaryEmail()!.email;
        try {
            await agent.Emails.sendVerificationCode(email as string)
        } catch (error) {
            console.log(error)
        }
    }

    codeVerification = async (code: string, email: string) => {
        try {
            return await agent.Account.codeVerification(email, code)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    changePassword = async (creds: PasswordUpdateValues) => {
        try {
            if (!creds.email) creds.email = this.user?.getPrimaryEmail()?.email as string;
            await agent.Account.changePassword(creds);
            toast.success('Password reset successfully. ');
            return 'Password reset successfully. ';
        } catch (error: unknown) {
            if (Array.isArray(error) && error[0] === 'Incorrect password.') {
                error[0] = 'Incorrect password, please use the current password!';
                toast.error(error[0] as string)
                throw error[0];
            }
            else {
                console.log('Problem updating password, please try again')
                throw 'Problem updating password, please try again';
            }
        }
    }

    login = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.login(creds);
            const userInstance = new User(user);
            store.commonStore.setToken(userInstance.token);
            this.startRefreshTokenTimer(userInstance);
            runInAction(() => this.user = userInstance);
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
            await agent.Account.register(creds);
            router.navigate(`/account/registerSuccess?email=${creds.email}`);
            store.notificationStore.getNotifications(new PagingParams(1, 5, store.notificationStore.newNotificationsCount), false);
            store.notificationStore.getUnreadNotificationsCount();
            store.modalStore.closeModal();
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 400) throw error;
            store.modalStore.closeModal();
            console.log(500);
        }
    }

    getUserPhones = async () => {
        try {
            const phones = await agent.Phones.getUserPhones();
            runInAction(() => {
                phones.forEach((phone) => {
                    if (!this.user!.phones.some((e) => e.number === phone.number)) {
                        this.user!.phones.push(phone); // Add email
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }
    };

    addPhone = async (phoneNumber: string) => {
        try {
            const phone = await agent.Phones.addPhone(phoneNumber);
            runInAction(() => { this.user?.phones.push(phone) })
        } catch (error) {
            console.log(error);
        }
    }

    setPrimaryPhone = async (phoneNumberId: number) => {
        try {
            await agent.Phones.setPrimary(phoneNumberId);
            runInAction(() => {
                const primaryPhone = this.getUserFromStore().getPrimaryPhone();
                if (primaryPhone) primaryPhone.isPrimary = false;

                const userPhone = this.getUserFromStore().getPhone(phoneNumberId);
                if (userPhone) userPhone.isPrimary = true;
            })
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    setPhoneVerification = async (phoneNumberId: number) => {
        try {
            await agent.Phones.setVerification(phoneNumberId);
            runInAction(() => {
                const userPhone = this.getUserFromStore().getPhone(phoneNumberId);
                if (userPhone) userPhone.isVerified = true;
            })
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    deletePhone = async (phoneNumberId: number) => {
        try {
            await agent.Phones.deletePhone(phoneNumberId);
            runInAction(() => {
                this.user!.phones = this.user!.phones.filter(phone => phone.id !== phoneNumberId);
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    getUserEmails = async () => {
        try {
            const emails = await agent.Emails.getUserEmails();
            runInAction(() => {
                emails.forEach((email) => {
                    if (!this.user!.emails.some((e) => e.email === email.email)) {
                        this.user!.emails.push(email); // Add email
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }
    };


    addEmail = async (email: string) => {
        try {
            const emailData = await agent.Emails.addEmail(email);
            runInAction(() => { this.user?.emails.push(emailData) })
        } catch (error) {
            console.log(error);
        }
    }

    setPrimary = async (emailId: number) => {
        try {
            await agent.Emails.setPrimary(emailId);
            runInAction(() => {
                const primaryEmail = this.getUserFromStore().getPrimaryEmail();
                if (primaryEmail) primaryEmail.isPrimary = false;

                const userEmail = this.getUserFromStore().getEmail(emailId);
                if (userEmail) userEmail.isPrimary = true;
            })
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    setVerification = async (emailId: number) => {
        try {
            await agent.Emails.setVerification(emailId);
            runInAction(() => {
                const userEmail = this.getUserFromStore().getEmail(emailId);
                if (userEmail) userEmail.isVerified = true;
            })
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    deleteEmail = async (emailId: number) => {
        try {
            await agent.Emails.deleteEmail(emailId);
            runInAction(() => {
                this.user!.emails = this.user!.emails.filter(email => email.id !== emailId);
            });
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

    getUserFromStore = () => {
        return (this.user) ? this.user : new User();
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            const userInstance = new User(user);
            store.commonStore.setToken(userInstance.token);
            runInAction(() => this.user = userInstance);
            store.notificationStore.getNotifications(new PagingParams(1, 5, store.notificationStore.newNotificationsCount), false);
            store.notificationStore.getUnreadNotificationsCount();
            this.startRefreshTokenTimer(userInstance);

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