import { observer } from 'mobx-react-lite';
import { useEffect } from 'react'
import { Divider, Tab } from 'semantic-ui-react';
import { useStore } from '../../app/stores/Store';
import ChatHeader from './ChatHeader';
import ChatContent from './ChatContent';
import ChatFooter from './ChatFooter';
import { Conversation } from '../../app/models/conversation';
import { autorun } from 'mobx';

interface Props {
    conversation?: Conversation | null;
}

export default observer(function Chatbox({ conversation }: Props) {
    const { conversationStore } = useStore();

    const isProduction = process.env.NODE_ENV === 'production';

    const { selectedConversation, send, setSelectedConversation, getUnReadMessageCount, getfirstUnreadMessageId
        , lastUnreadMessageId, GetMessages } = conversationStore

    useEffect(() => {
        setSelectedConversation(conversation!);
        autorun(() => {
            const unreadCount = getUnReadMessageCount;
            const firstUnreadId = getfirstUnreadMessageId;
            const lastId = lastUnreadMessageId;

            // Only log if not in production
            if (!isProduction) {
                console.log(unreadCount, firstUnreadId, lastId);
            }
        });
    }, [setSelectedConversation, conversation, getUnReadMessageCount, getfirstUnreadMessageId, lastUnreadMessageId, isProduction]);

    useEffect(() => {
        if (conversation?.conversationId) {
            GetMessages(conversation.conversationId, 10);
        }
    }, [conversation?.conversationId, GetMessages]);

    //var otherUser = new User();

    //if (OtherUser) {
    //    otherUser.displayName = OtherUser?.displayName!;
    //    otherUser.userName = OtherUser?.username!;
    //}
    //else {
    //    otherUser = (conversation?.user1.userName === store.userStore.user?.userName)
    //        ? conversation?.user2! : conversation?.user1!;
    //}

    //useEffect(() => {
    //    console.log(conversation?.conversationId + ' Opened')

    //    return () => {
    //        if (selectedConversation) {
    //            setSelectedConversation(null);
    //        }
    //        setPagingParams(new PagingParams());
    //        setScrollBottom(true);
    //        // This code runs when the component unmounts
    //        console.log(conversation?.conversationId + ' closed');
    //    };
    //}, [])
    //debugger
    return (
        selectedConversation &&
        <Tab.Pane className='CHATBOXXX'>
            <ChatHeader conversation={selectedConversation!} />
            <Divider />
            <ChatContent conversation={selectedConversation!} />
            <ChatFooter username={selectedConversation!.otherUser?.userName} send={send} />
        </Tab.Pane>
    );
});