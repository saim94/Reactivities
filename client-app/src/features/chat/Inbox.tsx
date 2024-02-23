import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react';
import { Grid, Menu, Segment, Container } from 'semantic-ui-react';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useStore } from '../../app/stores/Store'
import ChatPreviewComponent from './ChatPreviewComponent';

export default observer(function Inbox() {
    const [activeItem, setActiveItem] = useState('inbox');
    const { conversationStore } = useStore();
    const { conversations, listConversations, loadingInitial } = conversationStore;
    const handleItemClick = (_: React.MouseEvent<HTMLAnchorElement, MouseEvent>, name: string) => setActiveItem(name);

    useEffect(() => {
        if (conversations && conversations.length === 0)
            listConversations();
    }, [conversations, listConversations])

    if (loadingInitial) return <LoadingComponent content='Loading...' />

    return (
        <Grid>
            <Grid.Column width={5} style={{ paddingRight: '5px' }}>
                <Menu vertical fluid pointing>
                    {conversations.map(conversation => (
                        <Menu.Item
                            key={'M_' + conversation.conversationId}
                            name='inbox'
                            onClick={(e) => { handleItemClick(e, activeItem) }}
                        >
                            <ChatPreviewComponent conversation={conversation} key={'CP_' + conversation.conversationId} />
                        </Menu.Item>
                    ))}
                </Menu>
            </Grid.Column>

            <Grid.Column stretched width={11} style={{ paddingLeft: '5px' }}>
                <Segment raised>
                    <Container fluid>
                        This is a stretched grid column. This segment will always match the
                        tab height
                    </Container>
                </Segment>
            </Grid.Column>
        </Grid>
    );

});