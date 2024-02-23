import { observer } from "mobx-react-lite";
import { Grid, Message } from "semantic-ui-react";
import { ChatMessage } from "../../app/models/chatMessage";
import { store, useStore } from "../../app/stores/Store";
import MessageComponent from "./MessageComponent";

interface Props {
    message: ChatMessage;
    isMessageCard: boolean;
}

export default observer(function MessageGrid({ message, isMessageCard }: Props) {

    const { conversationStore } = useStore();
    const { selectedConversation } = conversationStore;

    return (
        <Grid key={message.messageId + '_g'}>
            {
                selectedConversation?.firstUnreadMessageId === message.messageId && (
                    <div key='newMessage' className='ui center aligned container'>
                        <Message style={{ margin: '4px' }} compact success size='tiny'>{selectedConversation?.unreadMessageCount + ` unread message`}</Message>
                    </div>
                )
            }
            <Grid.Row className='messageRow' key={message.messageId + '_r'}>
                <Grid.Column
                    width={(isMessageCard) ? 14 : 7}
                    floated={message.sender.userName === store.userStore.user?.userName ? 'right' : 'left'}
                    key={message.messageId + "_c"}
                    className='ui message messageColumn'
                    style={message.sender.userName === store.userStore.user?.userName ? { 'marginRight': '10px' } : { 'marginRight': '0px' }}
                >
                    <MessageComponent message={message} />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
})