import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { Activity, ActivityFormValues } from '../models/activity';
import { AppNotification } from '../models/appNotification';
import { ChatMessage } from '../models/chatMessage';
import { Conversation } from '../models/conversation';
import { PaginatedResult, PagingParams } from '../models/pagination';
import { Photo, Profile, UserActivity } from '../models/profile';
import { User, UserFormValues } from '../models/user';
import { router } from '../router/Routes';
import { store } from '../stores/Store';

const sleep = (delay: number) => {
    return new Promise((resolve => {
        setTimeout(resolve, delay);
    }))
}

//axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
//axios.defaults.headers.Authorization = `bearer ${localStorage.getItem('jwt')}`;
axios.interceptors.request.use(config => {
    const token = store.commonStore.token;
    if (token && config.headers) config.headers.Authorization = `bearer ${token}`;

    return config;
})

axios.interceptors.response.use(async response => {
    if (import.meta.env.DEV) await sleep(1000);
    const pagination = response.headers['pagination'];
    if (pagination) {
        response.data = new PaginatedResult(response.data, JSON.parse(pagination));
        return response as AxiosResponse<PaginatedResult<unknown>>;
    }
    return response;

}, (error: AxiosError) => {
    //debugger
    const { data, status, config, headers } = error.response as AxiosResponse;
    switch (status) {
        case 400:
            //toast.error('bad request');
            if (config.method === 'get' && data.errors && Object.prototype.hasOwnProperty.call(data.errors, 'id')) {
                router.navigate('/not-found')
            }
            if (data.errors) {
                const modalStateErrors = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modalStateErrors.push(data.errors[key]);
                    }
                }
                throw modalStateErrors.flat();
            } else {
                toast.error(data);
            }
            break;
        case 401: {
            const wwwAuthenticateHeader = headers?.['www-authenticate'] || headers?.['WWW-Authenticate'] || '';
            if (status === 401 && wwwAuthenticateHeader.toLowerCase().startsWith('bearer error="invalid_token"')) {
                toast.error('Session expired - please login again');
                store.userStore.logout();
            }
            break;
        }
        case 403:
            toast.error('forbidden');
            break;
        case 404:
            toast.error('not found');
            router.navigate('not-found');
            break;
        case 500:
            //toast.error('server error');
            store.commonStore.setServerError(data);
            router.navigate('/server-error');
            break;
    }
    return Promise.reject(error);
})

//axios.interceptors.response.use(response => {
//    return sleep(1000).then(() => {
//        return response;
//    }).catch((error) => {
//        console.log(error);
//        return Promise.reject(error);
//    })
//})

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: object) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: object) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
}

const Activities = {
    list: (params: URLSearchParams) => axios.get<PaginatedResult<Activity[]>>('/activities', { params })
        .then(responseBody),
    details: (id: string) => requests.get<Activity>(`/activities/${id}`),
    create: (activity: ActivityFormValues) => requests.post<AppNotification>(`/activities`, activity),
    update: (activity: ActivityFormValues) => requests.put<AppNotification[]>(`/activities/${activity.id}`, activity),
    delete: (id: string) => requests.del<void>(`/activities/${id}`),
    attend: (id: string) => requests.post<AppNotification>(`/activities/${id}/attend`, {})
}

const Account = {
    current: () => requests.get<User>('/account'),
    login: (user: UserFormValues) => requests.post<User>('/account/login', user),
    register: (user: UserFormValues) => requests.post<User>('/account/register', user),
    fbLogin: (accessToken: string) => requests.post<User>(`/account/fbLogin?accessToken=${accessToken}`, {}),
    refreshToken: () => requests.post<User>("/account/refreshToken", {})
}

const Conversations = {
    //list: () => requests.get<PaginatedResult<Conversation[]>>('/conversations'),
    list: (id: string, params: PagingParams) => axios.get<PaginatedResult<Conversation[]>>(`/conversations?id=${id}`, { params }).then(responseBody),
    get: (userName: string) => requests.get<Conversation>(`/conversations/${userName}`),
    delete: (conversationId: number) => requests.del<void>(`/conversations/${conversationId}`),
    getMessages: (conversationId: number, params: PagingParams) => axios.get<PaginatedResult<ChatMessage[]>>(`/messages/${conversationId}`, { params }),
    search: (searchQuery: string) => requests.get<Profile[]>(`/user?searchQuery=${searchQuery}`),
    count: () => requests.get<number>('/user/Count')
}

const Notifications = {
    list: (params: PagingParams, unRead: boolean) => axios.get<PaginatedResult<AppNotification[]>>(`/notification?unRead=${unRead}`, { params })
        .then(responseBody),
    markAsread: () => requests.post<void>('/notification/mark-as-read', {}),
    removeNotification: (notificationId: string) => requests.del(`/notification/${notificationId}`),
    readNotification: (notificationId: string) => requests.post<void>(`/notification/${notificationId}`, {}),
    unreadNotificationsCount: () => requests.get<number>('/notification/GetUnreadNotificationsCount')
}

const Profiles = {
    get: (username: string) => requests.get<Profile>(`/profiles/${username}`),
    uploadPhoto: (file: Blob) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post<Photo>('photos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => requests.del(`/photos/${id}`),
    //edit: (profile: Partial<Profile>) => requests.put(`/photos/`, profile)
    updateProfile: (profile: Partial<Profile>) => requests.put(`/profiles`, profile),
    updateFollowing: (username: string) => requests.post<AppNotification>(`/follow/${username}`, {}),
    listFollowings: (username: string, predicate: string) =>
        requests.get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
    listActivities: (username: string, predicate: string) =>
        requests.get<UserActivity[]>(`/profiles/${username}/activities?predicate=${predicate}`)
}

const agent = {
    Activities,
    Account,
    Profiles,
    Conversations,
    Notifications
}

export default agent;

