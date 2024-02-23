import { observer } from "mobx-react-lite";
import { Grid, Header, Segment } from "semantic-ui-react";
import { Conversation } from "../../app/models/conversation";
import ChatOptions from "./ChatOptions";

interface Props {
    conversation: Conversation
    //displayName?: string
}

export default observer(function ChatHeader({ conversation }: Props) {
    return (
        <Segment>
            <Grid centered>
                <Grid.Row>
                    <Grid.Column textAlign="center" color='blue'>
                        <Header floated='left' icon='inbox' content={`Chat ${conversation.otherUser.displayName}`} dividing />
                        <ChatOptions
                            conversationId={(conversation != null) ? conversation!.conversationId : 0}
                            messagesCount={conversation?.messages.length}
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    )
})