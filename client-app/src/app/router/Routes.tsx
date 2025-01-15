import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import ActivityForm from "../../features/activities/form/ActivityForm";
import Inbox2 from "../../features/chat/Inbox2";
import NotFound from "../../features/errors/NotFound";
import ServerError from "../../features/errors/ServerError";
import TestErrors from "../../features/errors/TestError";
import NotificationsPage from "../../features/notifications/NotificationsPage";
import ProfilePage from "../../features/profiles/ProfilePage";
import ConfirmEmail from "../../features/users/ConfirmEmail";
import PasswordReset from "../../features/users/PasswordReset";
import RegisterSuccess from "../../features/users/RegisterSuccess";
import App from "../layout/App";
import RequiredAuth from "./RequiredAuth";

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                element: <RequiredAuth />, children: [
                    { path: 'activities', element: <ActivityDashboard /> },
                    { path: 'activities/:id', element: <ActivityDetails /> },
                    { path: 'createActivity', element: <ActivityForm key='create' /> },
                    { path: 'manage/:id', element: <ActivityForm key='manage' /> },
                    { path: 'profiles/:username', element: <ProfilePage /> },
                    //{ path: 'inbox', element: <Inbox /> },
                    { path: 'inbox/:id/Chat', element: <Inbox2 /> },
                    { path: 'inbox/', element: <Inbox2 /> },
                    /*{ path: 'chat', element: <ChatBox />, },*/
                    { path: 'errors', element: <TestErrors /> },
                    { path: '/profiles/', element: <NotFound /> },
                    { path: 'notifications/', element: <NotificationsPage /> },
                ]
            },

            { path: 'not-found', element: <NotFound /> },
            { path: 'server-error', element: <ServerError /> },
            { path: 'account/registerSuccess', element: <RegisterSuccess /> },
            { path: 'emails/verifyEmail', element: <ConfirmEmail /> },
            { path: 'account/passwordReset', element: <PasswordReset /> },
            { path: '*', element: <Navigate replace to='not-found' /> }
        ]
    }
]

export const router = createBrowserRouter(routes)