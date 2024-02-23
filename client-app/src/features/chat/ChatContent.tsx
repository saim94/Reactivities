import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Button, Container, Segment } from "semantic-ui-react";
import { Conversation } from "../../app/models/conversation";
import { PagingParams } from "../../app/models/pagination";
import { useStore } from "../../app/stores/Store";
import CommentPlaceholder from "./CommentPlaceholder";
import MessageGroups from "./MessageGroups";

interface Props {
    conversation: Conversation;
}

export default observer(function ChatContent({ conversation }: Props) {

    const { conversationStore, commonStore } = useStore();
    const { loadingMessages, setPagingParams, pagination, GetMessages, groupedMessages, updateIsRead, lastUnreadMessageId,
    } = conversationStore;

    const { syncPages, setSyncPages, scrollBottom, setScrollBottom } = commonStore;

    const messagesContainerRef = useRef<null | HTMLDivElement>(null);
    const scrollPosition = useRef(0);
    const prevMessagesHeight = useRef(0);
    const [showBottomButton, setShowBottomButton] = useState(false);

    /*-------------------------------------------------------NEW CODE-------------------------------------------------------------- */

    const scrollToBottom = () => {
        //debugger;
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            scrollPosition.current = messagesContainerRef.current?.scrollTop;
        }

        setScrollBottom(true);
        setShowBottomButton(false);
        prevMessagesHeight.current = 0;
    };

    const handleScroll = (/*event: React.UIEvent<HTMLDivElement>*/) => {

        const container = messagesContainerRef.current;
        if (container) {
            //debugger;
            let scrollTop = 0;
            if (scrollBottom) {
                scrollTop = Math.round(scrollPosition.current);
                setScrollBottom(false);
            } else {
                scrollTop = Math.round(container.scrollTop);
            }

            const isAtBottom = (container.scrollHeight - scrollTop - container.clientHeight) < 10;
            const isNotAtBottom = (container.scrollHeight - scrollTop - container.clientHeight) > 10;

            if (isAtBottom) {
                setScrollBottom(true);
                setShowBottomButton(false);
            }
            if (isNotAtBottom) {
                setScrollBottom(false);
                setShowBottomButton(true);
            }
            scrollPosition.current = container.scrollTop;
        }
    }

    useEffect(() => {

        if (scrollBottom) {
            scrollToBottom();
        }
        else {
            if (prevMessagesHeight.current > 0 && messagesContainerRef.current) {
                const newScrollPosition = messagesContainerRef.current.scrollHeight - prevMessagesHeight.current;
                messagesContainerRef.current.scrollTo(0, newScrollPosition);
                scrollPosition.current = messagesContainerRef.current?.scrollTop;
            }
        }

    }, [conversation.conversationId, conversation.messages.length, scrollBottom, setScrollBottom])

    useEffect(() => {

        if (lastUnreadMessageId > 0 && scrollBottom) {
            updateIsRead(lastUnreadMessageId)
        }

    }, [conversation.messages.length, lastUnreadMessageId, scrollBottom, updateIsRead]);

    /*-------------------------------------------------------NEW CODE------------------------------------------------------------- */

    function CanLoadMore(): boolean {
        return !!pagination && pagination.currentPage < pagination.totalPages;
    }

    const loadMore = () => {
        //debugger;
        if (CanLoadMore()) {
            //debugger;
            if (syncPages)
                setPagingParams(new PagingParams(1, (pagination!.currentPage + 1) * 10));
            else
                setPagingParams(new PagingParams(pagination!.currentPage + 1, 10));

            setScrollBottom(false);

            GetMessages(conversation!.conversationId);
            //.then(() => {
            //    setLoadingNext(false);
            //})
            //.catch(() => setLoadingNext(false));

            if (messagesContainerRef && messagesContainerRef.current) {
                prevMessagesHeight.current = messagesContainerRef.current.scrollHeight;
            }
            setSyncPages(false);
        }
    };

    return (
        <Segment raised clearing>
            <Container>
                <div className='chatbox-container comment-group-width ui comments' ref={messagesContainerRef} onScroll={handleScroll}>
                    <InfiniteScroll
                        pageStart={1}
                        threshold={1}
                        loadMore={loadMore}
                        hasMore={CanLoadMore()}
                        initialLoad={false} // Set to false to manually trigger loading
                        useWindow={false} // Change this to true if you want the infinite scroll to work with the entire window scroll
                        isReverse={true} // Set to true to enable upward infinite scrolling
                    >
                        {conversation?.messages.length === 0 ? (
                            <Container fluid className='ui message'>
                                Start Conversation
                            </Container>
                        ) : (
                            <div>
                                {loadingMessages && <CommentPlaceholder />}
                                {groupedMessages.map(messageGroup => (
                                    <MessageGroups key={messageGroup[0]} messageGroup={messageGroup} />
                                ))}
                            </div>
                        )}
                    </InfiniteScroll>

                    <div className={`back-to-bottom-container ${(showBottomButton && conversation.unreadMessageCount > 0 && conversation && conversation.messages.length > 0) ? 'visible' : 'hidden'} count`}>
                        <Button
                            className='back-to-bottom-button'
                            floated='right'
                            size='mini'
                            onClick={scrollToBottom}
                            content={conversation.unreadMessageCount}
                            positive
                            circular
                            compact
                        />
                    </div>
                    <div className={`back-to-bottom-container ${(showBottomButton && conversation && conversation.messages.length > 0) ? 'visible' : 'hidden'}`}>
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
                </div>
            </Container>
        </Segment>
    )
})