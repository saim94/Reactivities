import { observer } from 'mobx-react-lite'
import { Message, Tab } from 'semantic-ui-react'
import { useStore } from '../../app/stores/Store'
import Chatbox from './ChatBox'

export default observer(function Inbox() {
    const { profileStore, userStore } = useStore();
    return (
        <Tab.Pane>
            {
                userStore.user?.userName !== profileStore.profile?.username &&
                <Chatbox />
            }
            {
                userStore.user?.userName === profileStore.profile?.username &&
                <Message positive>
                    <Message.Content>Coming Soon</Message.Content>
                </Message>
            }
        </Tab.Pane>
    )
});