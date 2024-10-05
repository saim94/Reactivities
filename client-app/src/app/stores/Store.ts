import { createContext, useContext } from "react";
import ActivityStore from "./ActivityStore";
import CommentStore from "./commentStore";
import CommonStore from "./CommonStore";
import ConversationStore from "./ConversationStore";
import ModalStore from "./modalStore";
import NotificationStore from "./NotificationStore";
import ProfileStore from "./profileStore";
import UserStore from "./userStore";

interface Store {
    activityStore: ActivityStore;
    commonStore: CommonStore;
    userStore: UserStore;
    modalStore: ModalStore;
    profileStore: ProfileStore;
    commentStore: CommentStore;
    conversationStore: ConversationStore;
    notificationStore: NotificationStore;
}

export const store: Store = {
    activityStore: new ActivityStore(),
    commonStore: new CommonStore(),
    userStore: new UserStore(),
    modalStore: new ModalStore(),
    profileStore: new ProfileStore(),
    commentStore: new CommentStore(),
    conversationStore: new ConversationStore(),
    notificationStore: new NotificationStore(),
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}


