import { observer } from "mobx-react-lite";
import { Header, Segment } from "semantic-ui-react";
import { ChatMessage } from "../../app/models/chatMessage";
import { DateUtils } from "../../utils/dateUtils";
import MessageGrid from "./MessageGrid";

interface Props {
    messageGroup: [group: string, messages: ChatMessage[]]
}

export default observer(function MessageGroups({ messageGroup }: Props) {
    const group = messageGroup[0];
    const messages = messageGroup[1];
    return (
        <Segment key={group} basic className='messagesSegment'>
            <Header sub color='teal' textAlign='center' className='messageGroupHeader'>
                {DateUtils(group)}
            </Header>
            {messages.map(message => (
                <MessageGrid message={message} isMessageCard={false} key={message.messageId + '_g'} />
            ))}
        </Segment>
    )
})