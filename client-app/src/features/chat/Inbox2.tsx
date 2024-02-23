import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useParams } from 'react-router-dom';
import { Menu, Button, Label, Container, Grid } from 'semantic-ui-react';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { PagingParams } from '../../app/models/pagination';
import { useStore } from '../../app/stores/Store';
import { FindConversation, FindConversationIdByUserId } from '../../utils/helper';
import ChatBox from './ChatBox';
import ChatPreviewComponent from './ChatPreviewComponent';
import CommentPlaceholderWithAvatar from './CommentPlaceholderWithAvatar';
import DefaultInboxTab from './DefaultInboxTab';


export default observer(function Inbox2() {
    let { id } = useParams<{ id: string }>();
    const { conversationStore, commonStore } = useStore();
    const {
        conversations,
        listConversations,
        loadingInitial,
        emptyconversations,
        setPagingParams,
        setPagingParamsConversation,
        paginationConversation,
        loadingConversations,
        setOpenInbox
    } = conversationStore;

    const { setScrollBottom, setShowLabel } = commonStore;

    if (!id) id = '';

    const conversationIdRef = useRef('0');
    const [activeTab, setActiveTab] = useState<string | 'default'>('default');

    function CanLoadMore(): boolean {
        return !!paginationConversation && paginationConversation.currentPage < paginationConversation.totalPages;
    }

    const loadMore = () => {
        if (CanLoadMore()) {
            setPagingParamsConversation(new PagingParams(paginationConversation!.currentPage + 1, 10));
            listConversations(id)
        }
    };

    useEffect(() => {
        //emptyconversations();
        listConversations(id);
        //console.log('Inbox Opened');
        return () => {
            //console.log('Inbox Closed');
            emptyconversations();
        }
    }, [id, emptyconversations, listConversations])

    useEffect(() => {
        if (id && conversations) {
            const conversationId = FindConversationIdByUserId(conversations, id);
            if (conversationId !== -1) {
                setActiveTab(conversationId.toString());
            }
        }
    }, [id, conversations, conversations.length, setActiveTab])

    const handleTabClick = (tabName: string) => {
        if (conversationIdRef.current !== tabName) {
            setPagingParams(new PagingParams());
            setScrollBottom(true);
            conversationIdRef.current = tabName;
            const conversation = FindConversation(conversations, Number.parseInt(tabName));
            if (conversation) {
                //router.navigate(`/inbox/${conversation.otherUser.id}/Chat`, { replace: true });
                window.history.pushState(null, ' ', `/inbox/${conversation.otherUser.id}/Chat`);
                setOpenInbox(true);
            }
            if (tabName === 'default') {
                window.history.pushState(null, ' ', '/inbox/');
                //router.navigate('/inbox/', { replace: true });
                setOpenInbox(false);
            }
        }
        setActiveTab(tabName);
    };

    //useEffect(() => {
    //    if (activeTab !== 'default') {
    //        let loggedInUser = store.userStore.user?.userName;
    //        loggedInUser = (loggedInUser) ? loggedInUser : '';
    //        const conversation = FindConversation(conversations, Number.parseInt(activeTab));
    //        if (conversation) {
    //            //const unreadMessageCount = GetUnreadMessageCount(loggedInUser, conversation);
    //            const firstunreadMessageId = GetFirstUnreadMessageId(loggedInUser, conversation);
    //            if (/*unreadMessageCount > 0 &&*/ firstunreadMessageId > 0 && firstUnread_MessageId == 0) {
    //                setFirstUnread_MessageIdCalBack(firstunreadMessageId);
    //                //setUnReadMessageCountCalBack(unreadMessageCount);
    //            }
    //        }
    //    }
    //}, [activeTab, setFirstUnread_MessageIdCalBack, setUnReadMessageCountCalBack]);

    useEffect(() => {
        setShowLabel(false);
        return () => {
            setShowLabel(true);
        }
    }, [setShowLabel])

    if (loadingInitial) return <LoadingComponent content='Loading Inbox...' />;

    return (
        <Container fluid>
            <Grid>
                <Grid.Column width={4} className='chatMenu'>
                    <InfiniteScroll
                        pageStart={1}
                        loadMore={loadMore}
                        hasMore={CanLoadMore()}
                        initialLoad={false}
                        useWindow={false}
                        isReverse={false}
                    >
                        <Menu vertical fluid pointing>
                            <Menu.Item header icon='conversation'
                                name='INBOX'
                                active={activeTab === 'default'}
                                onClick={() => handleTabClick('default')}
                            />
                            {conversations.map((conversation) => {
                                //debugger;
                                //const messageCount = GetUnreadMessageCount(
                                //    store.userStore.user?.userName ? store.userStore.user?.userName : "",
                                //    conversation
                                //);

                                return (
                                    <Menu.Item
                                        style={{ padding: '0px' }}
                                        key={conversation.conversationId}
                                        name={conversation.conversationId.toString()}
                                        active={activeTab === conversation.conversationId.toString()}
                                        onClick={() => handleTabClick(conversation.conversationId.toString())}
                                    >
                                        <Button style={{ textAlign: 'left', margin: '0px !important' }} className='item container'>
                                            {conversation.unreadMessageCount > 0 && (
                                                <Label color='red' floating ribbon>
                                                    {conversation.unreadMessageCount}
                                                </Label>
                                            )}
                                            <ChatPreviewComponent conversation={conversation} />
                                        </Button>
                                    </Menu.Item>
                                );
                            })}
                            {loadingConversations && (
                                <div>
                                    {/*<Loader active inline='centered' size='tiny' />*/}
                                    <CommentPlaceholderWithAvatar />
                                </div>
                            )}
                        </Menu>
                    </InfiniteScroll>
                </Grid.Column>
                <Grid.Column width={12} className='menuContent'>
                    {/*<Segment className='InboxCon'>*/}
                    {activeTab === 'default' ? (
                        <DefaultInboxTab />
                    ) : (
                        <ChatBox conversation={conversations.find((conv) => conv.conversationId.toString() === activeTab)} />
                    )}
                    {/*</Segment>*/}
                </Grid.Column>
            </Grid>
        </Container>
    );
});
