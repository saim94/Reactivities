import { observer } from "mobx-react-lite";
import { Grid, Icon, Message, Tab } from "semantic-ui-react";
import ChatSearchModel from "./ChatSearchModel";

export default observer(function DefaultInboxTab() {

    return (
        <Tab.Pane>
            <Grid className='defaultTab' style={{ height: 'calc(87vh)' }}>
                <Grid.Column width={16} textAlign='center' verticalAlign='middle'>
                    <Message>
                        <Icon size='large' className='envelope' />
                        <Message.Header>Your messages</Message.Header>
                        <Message.Content>
                            Send private photos and messages to a friend or other people
                        </Message.Content>
                        <ChatSearchModel />
                    </Message>
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
})