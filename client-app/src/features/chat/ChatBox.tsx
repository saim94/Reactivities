import { Field, FieldProps, Form, Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button, Container, Divider, Grid, Header, Segment, Message, Loader, Tab } from 'semantic-ui-react';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { MessageData } from '../../app/models/messageData';
import { store, useStore } from '../../app/stores/Store';
import * as Yup from 'yup';
import ChatOptions from './ChatOptions';
import { DateUtils } from '../../utils/dateUtils';
import MessageComponent from './MessageComponent';
import InfiniteScroll from 'react-infinite-scroller';
import { PagingParams } from '../../app/models/pagination';
import CommentPlaceholder from './CommentPlaceholder';
import { useParams } from 'react-router-dom';
import { router } from '../../app/router/Routes';

export default observer(function Chatbox() {
    const { username } = useParams<{ username: string }>();
    if (!username)
        router.navigate('not-found');
    const { profileStore: { profile, loadProfile }, conversationStore:
        { GetConversation, selectedConversation, loadingConversation, send, updateIsRead, groupedMessages, /*setOpenInbox,*/
            setPagingParams, pagination, GetMessages, loadingMessages, getLastUnreadMessageId, isdeleting, setIsDeleting, /*inboxOpen,*/
            firstUnread_MessageId, unReadMessageCount, setFetchMessages, fetchMessages, getUnReadMessageCount
        },
    } = useStore();
    const divRef = useRef<null | HTMLDivElement>(null);
    const messagesContainerRef = useRef<null | HTMLDivElement>(null);
    const scrollPosition = useRef(0);
    const [loadingNext, setLoadingNext] = useState(false);
    const [scrollBottom, setScrollBottom] = useState(true);
    const prevMessagesHeight = useRef(0);
    const [syncPages, setSyncPages] = useState(false);
    const [showBottomButton, setShowBottomButton] = useState(false);

    useEffect(() => {

        if (username !== undefined && profile === null) {
            loadProfile(username);
        }
        if ((!selectedConversation || selectedConversation.messages.length === 0 && selectedConversation.conversationId !== 0) && username) {
            GetConversation(username);
        }
    }, [username, GetConversation, loadProfile, profile, selectedConversation])

    useLayoutEffect(() => {
        if (selectedConversation && selectedConversation!.messages.length > 0 && scrollBottom && !isdeleting) {
            scrollToBottom();
        } else {
            if (prevMessagesHeight.current > 0 && messagesContainerRef.current && !isdeleting) {
                const newScrollPosition = messagesContainerRef.current.scrollHeight - prevMessagesHeight.current;
                messagesContainerRef.current.scrollTo(0, newScrollPosition);
            }
        }

    }, [selectedConversation, selectedConversation?.messages, selectedConversation?.messages.length,/*'EXTRA ADDED=>' ,*/ isdeleting, scrollBottom]);

    useEffect(() => {
        const lastUnreadMessageId = getLastUnreadMessageId();
        if (lastUnreadMessageId > 0 && !isdeleting && scrollBottom)
            updateIsRead(lastUnreadMessageId);

        if (messagesContainerRef && messagesContainerRef.current) {
            if (messagesContainerRef.current.scrollHeight < messagesContainerRef.current.clientHeight && showBottomButton)
                setShowBottomButton(false);
        }

        if (isdeleting) setIsDeleting(false);
        if (fetchMessages) setFetchMessages(false);

    }, [selectedConversation, selectedConversation?.messages.length, getLastUnreadMessageId, updateIsRead, scrollBottom, showBottomButton, setShowBottomButton, fetchMessages, isdeleting, setFetchMessages, setIsDeleting]);

    //useEffect(() => {
    //    //debugger;
    //    if (!inboxOpen) {
    //        setOpenInbox(true);
    //        console.log('Inbox Opened')
    //    }
    //    return () => {
    //        //debugger;
    //        console.log('Inbox closed')
    //        setOpenInbox(false);
    //    }
    //}, [])

    function handleScroll(event: React.UIEvent<HTMLDivElement>) {
        if (event.currentTarget.scrollTop === 0) {
            //setLoadingNext(true); //Temp
            setScrollBottom(false); //to trigger scroll bottom for load messages request
            //console.log('Loading messsages');
            //console.log(event.currentTarget.scrollHeight);
            //if (messagesContainerRef && messagesContainerRef.current) {
            //    console.log(messagesContainerRef.current.scrollHeight);
            //}
        }
        //if (event.currentTarget.scrollTop < (event.currentTarget.scrollHeight - 20)) {
        //    debugger
        //    var a = event.currentTarget.scrollHeight
        //    var a1 = event.currentTarget.clientHeight
        //    setShowBottomButton(true);
        //    setScrollBottom(false); //for stopping scroll bottom
        //}
        const containerHeight = event.currentTarget.clientHeight;
        const maxScrollHeight = event.currentTarget.scrollHeight;
        const scrollCurrentPosition = event.currentTarget.scrollTop;

        if (maxScrollHeight - scrollCurrentPosition - containerHeight > 20) {
            //debugger
            setShowBottomButton(true);
            setScrollBottom(false); //for stopping scroll bottom
        }
        if (maxScrollHeight - scrollCurrentPosition - containerHeight < 20) {
            //debugger
            setShowBottomButton(false);
            setScrollBottom(true);
        }
        if (maxScrollHeight < containerHeight) {
            setShowBottomButton(false);
        }
        //if (event.currentTarget.scrollTop === event.currentTarget.scrollHeight) {
        //    var a = event.currentTarget.scrollHeight
        //    var a = event.currentTarget.clientHeight
        //    debugger
        //    setShowBottomButton(false);
        //    //setScrollBottom(false); //for stopping scroll bottom
        //}
        //else if (event.currentTarget.scrollTop < 100) {
        //    setLoadingNext(true);
        //    //setScrollBottom(false);
        //}
        if (isdeleting)
            scrollPosition.current = event.currentTarget.scrollTop;
        //console.log(event.currentTarget.scrollTop)
        //console.log(event.type)
        //console.log(event.currentTarget.clientHeight)
        //console.log(event.currentTarget.scrollHeight)
        //console.log('------messagesContainerRef Start-----')
        //console.log(messagesContainerRef.current?.scrollTop)
        //console.log(messagesContainerRef.current?.clientHeight)
        //console.log(messagesContainerRef.current?.scrollHeight)
        //console.log('-----messagesContainerRef End------')
    }



    const scrollToBottom = () => {
        //debugger;
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
        setShowBottomButton(false);
    };

    const loadMore = () => {
        if (syncPages)
            setPagingParams(new PagingParams(1, (pagination!.currentPage + 1) * 10));
        else
            setPagingParams(new PagingParams(pagination!.currentPage + 1, 10));

        GetMessages(selectedConversation!.conversationId)
            .then(() => {
                setLoadingNext(false);
            })
            .catch(() => setLoadingNext(false));
        //debugger;
        if (messagesContainerRef && messagesContainerRef.current) {
            prevMessagesHeight.current = messagesContainerRef.current.scrollHeight;
        }
        setSyncPages(false);
    };

    function CanLoadMore() {
        const loadMore = (/*loadingNext &&*/ !!pagination && pagination.currentPage < pagination.totalPages);
        //if (messagesContainerRef && messagesContainerRef.current && loadMore) {
        //    //messagesContainerRef.current!.scrollTop = 10;
        //    //setScrollBottom(false); //to stop scroll bottom.(Remove this and other added in HandleScroll if any problem, debug and try something different.)
        //}
        //setLoadingNext(false);
        return loadMore;
    }
    if (loadingConversation) return <LoadingComponent />;

    return (
        <Tab.Pane>
            <>
                <Segment>
                    <Grid centered>
                        <Grid.Row>
                            <Grid.Column textAlign="center" color='blue'>
                                <Header floated='left' icon='inbox' content={`Chat ${profile?.displayName}`} dividing />
                                <ChatOptions
                                    conversationId={(selectedConversation != null) ? selectedConversation!.conversationId : 0}
                                    messagesCount={selectedConversation?.messages.length}
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                <Divider />
                <Segment raised>
                    <div className='chatbox-container comment-group-width ui comments' ref={messagesContainerRef} onScroll={handleScroll}>
                        {loadingNext && loadingMessages ? (
                            <>
                                <CommentPlaceholder />
                                <CommentPlaceholder />
                            </>
                        ) : (

                            <InfiniteScroll
                                pageStart={1}
                                loadMore={loadMore}
                                hasMore={CanLoadMore()}
                                threshold={500}
                                initialLoad={false} // Set to false to manually trigger loading
                                useWindow={false} // Change this to true if you want the infinite scroll to work with the entire window scroll
                                isReverse={true} // Set to true to enable upward infinite scrolling
                            >
                                {selectedConversation?.messages.length === 0 ? (
                                    <Container fluid className='ui message'>
                                        Start Conversation
                                    </Container>
                                ) : (
                                    <div>
                                        {groupedMessages.map(([group, messageGroup]) => (
                                            <Segment key={group} basic className='messagesSegment'>
                                                <Header sub color='teal' textAlign='center' className='messageGroupHeader'>
                                                    {DateUtils(group)}
                                                </Header>

                                                {messageGroup.map(message => (
                                                    <Grid key={message.messageId + '_g'}>
                                                        {
                                                            firstUnread_MessageId === message.messageId && (
                                                                <div key='newMessage' ref={divRef} className='ui center aligned container'>
                                                                    <Message style={{ margin: '4px' }} compact success size='tiny'>{unReadMessageCount + ` unread message`}</Message>
                                                                </div>
                                                            )
                                                        }
                                                        <Grid.Row className='messageRow' key={message.messageId + '_r'}>
                                                            <Grid.Column
                                                                width={7}
                                                                floated={message.sender.userName === store.userStore.user?.userName ? 'right' : 'left'}
                                                                key={message.messageId + "_c"}
                                                                className='ui message messageColumn'
                                                                style={message.sender.userName === store.userStore.user?.userName ? { 'marginRight': '10px' } : { 'marginRight': '0px' }}
                                                            >
                                                                <MessageComponent message={message} />
                                                            </Grid.Column>
                                                        </Grid.Row>
                                                    </Grid>
                                                ))}
                                            </Segment>
                                        ))}
                                    </div>
                                )}
                            </InfiniteScroll>

                        )}

                        <div className={`back-to-bottom-container ${(showBottomButton && getUnReadMessageCount > 0 && selectedConversation && selectedConversation.messages.length > 0) ? 'visible' : 'hidden'} count`}>
                            <Button
                                className='back-to-bottom-button'
                                floated='right'
                                size='mini'
                                onClick={scrollToBottom}
                                content={getUnReadMessageCount}
                                positive
                                circular
                                compact
                            />
                        </div>
                        <div className={`back-to-bottom-container ${(showBottomButton && selectedConversation && selectedConversation.messages.length > 0) ? 'visible' : 'hidden'}`}>
                            <Button
                                className='back-to-bottom-button'
                                floated='right'
                                size='mini'
                                onClick={scrollToBottom}
                                icon='arrow circle down'
                                circular
                                compact
                            />
                        </div>
                        {/*)}*/}
                    </div>
                </Segment>
                <Formik
                    initialValues={new MessageData("", username!, "")}
                    onSubmit={(values, { resetForm }) => {
                        //console.log(values)
                        resetForm();
                        send(values);
                        //handleRemoveDiv();
                        setScrollBottom(true);
                        setSyncPages(true);
                        //setShouldDisplay(false);
                    }}
                    validationSchema={Yup.object({
                        messageContent: Yup.string().trim().required('Please type Your message to send')
                    })}
                >

                    {({ isSubmitting, isValid, dirty, handleSubmit }) => (
                        <Form className='ui form'>
                            <Field name='messageContent'>
                                {(props: FieldProps) => (
                                    <div style={{ position: 'relative' }}>
                                        <Loader active={isSubmitting} />
                                        <textarea
                                            placeholder='Enter your comment(Enter to submit, SHIFT + enter for new line )'
                                            rows={2}
                                            {...props.field}
                                            onKeyPress={e => {
                                                if (e.key === 'Enter' && e.shiftKey) {
                                                    return;
                                                }
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    isValid && handleSubmit();
                                                }
                                            }}
                                        />
                                        <Button
                                            style={{ marginTop: '0.5px' }}
                                            primary
                                            type='submit'
                                            loading={isSubmitting}
                                            content='Send'
                                            disabled={!isValid || !dirty}
                                            icon='send'
                                            labelPosition="left"
                                        />
                                    </div>

                                )}
                            </Field>

                        </Form>
                    )}
                </Formik>
            </>
        </Tab.Pane>
    );
});
