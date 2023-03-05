import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { request } from 'https';
import { config } from 'process';
import { toast } from 'react-toastify';
import { debug } from 'util';
import { Activity } from '../models/activity';
import { User, UserFormValues } from '../models/user';
import { router } from '../router/Routes';
import { store } from '../stores/Store';

const sleep = (delay: number) => {
    return new Promise((resolve => {
        setTimeout(resolve, delay);
    }))
}

axios.defaults.baseURL = 'http://localhost:5000/api';
//axios.defaults.headers.Authorization = `bearer ${localStorage.getItem('jwt')}`;


axios.interceptors.request.use(config => {
    const token = store.commonStore.token;
    if (token && config.headers) config.headers.Authorization = `bearer ${token}`;

    return config;
})

axios.interceptors.response.use(async response => {
    await sleep(1000);
    return response;

}, (error: AxiosError) => {
    const { data, status, config } = error.response as AxiosResponse;
    switch (status) {
        case 400:
            debugger;
            //toast.error('bad request');
            if (config.method === 'get' && data.errors && data.errors.hasOwnProperty('id')) {
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
        case 401:
            toast.error('unauthorized');
            break;
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
    post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
}

const Activities = {
    list: () => requests.get<Activity[]>('/activities'),
    details: (id: string) => requests.get<Activity>(`/activities/${id}`),
    create: (activity: Activity) => requests.post<void>(`/activities`, activity),
    update: (activity: Activity) => requests.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => requests.del<void>(`/activities/${id}`)
}

const Account = {
    current: () => requests.get<User>('/account'),
    login: (user: UserFormValues) => requests.post<User>('/account/login', user),
    register: (user: UserFormValues) => requests.post<User>('/account/register', user)
}

const agent = {
    Activities,
    Account
}

export default agent;
