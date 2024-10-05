import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import { Container, Grid, Header, Icon, Button, Segment, Message, Dropdown } from 'semantic-ui-react';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { AppNotification } from '../../app/models/appNotification';
import { PagingParams } from '../../app/models/pagination';
import { useStore } from '../../app/stores/Store';
import { DateUtils1 } from '../../utils/dateUtils';
import NotificationPageDropdown from './NotificationPageDropdown';
import NotificationPagePlaceholder from './NotificationPagePlaceholder';

export default observer(function NotificationsPage() {

    const { notificationStore: { notifications, pagination, setPagingParams, setPagingParamsFunc, pagingParams, getNotifications, loading,
        loadingInitial, resetNotifications, removeNotification, readNotification } } = useStore();

    const [unRead, setunRead] = useState(false);
    const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

    useEffect(() => {
        if (notifications?.length === 0 && pagination) {
            setPagingParams(new PagingParams(pagination!.currentPage + 1, 5));
            getNotifications(pagingParams, false);
        }
    }, [getNotifications, setPagingParams])

    function CanLoadMore(): boolean {
        return !!pagination && pagination.currentPage < pagination.totalPages;
    }

    const loadMore = () => {
        if (CanLoadMore()) {
            if (CanLoadMore() && pagination) {
                //setPagingParams(new PagingParams(pagination!.currentPage + 1, 5));
                //getNotifications(pagingParams, false);
                const _pagingParams = setPagingParamsFunc(new PagingParams(pagination.currentPage + 1, 5));
                //getNotifications(_pagingParams, unRead);
                getNotifications(_pagingParams, unRead);
            }
        }
    };

    const handleReadUnReadClick = (_unRead: boolean) => {
        setunRead(_unRead);
        resetNotifications();
        //setPagingParams(new PagingParams(1, 5));
        const _pagingParams = setPagingParamsFunc(new PagingParams(1, 5));
        getNotifications(_pagingParams, _unRead, true);
    }

    const handleRemoveClick = (notificationId: string) => {
        //e.stopPropagation();
        removeNotification(notificationId);
    }
    const handleReadClick = (notification: AppNotification) => {
        //e.stopPropagation();
        if (!notification.isRead)
            readNotification(notification.notificationId);
    }

    if (loadingInitial) return <LoadingComponent content='Loading Notifications...' />;

    return (
        <Container>
            <Grid centered>
                <Grid.Column width={10}>
                    <Header as="h2" icon textAlign="center">
                        <Icon name="bell" />
                        Notifications
                        <Header.Subheader>Stay informed about recent activity</Header.Subheader>
                    </Header>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Button as={Link} basic size='mini' onClick={() => handleReadUnReadClick(true)}>
                                Unread
                            </Button>
                            <Button as={Link} basic size='mini' onClick={() => handleReadUnReadClick(false)}>
                                All
                            </Button>
                        </div>
                        <NotificationPageDropdown />
                    </div>

                    <Segment.Group style={{ marginTop: '10px' }}>
                        {notifications && notifications.length === 0 && !loading ? (
                            <Message floating><Message.Content> No notifications</Message.Content></Message>
                        ) : (
                            <InfiniteScroll
                                pageStart={1}
                                loadMore={loadMore}
                                hasMore={true}
                                initialLoad={false}
                                isReverse={false}
                            >
                                {(notifications) && notifications.map((notification) => (
                                    <Segment
                                        key={notification.notificationId}
                                        size='small'
                                        style={{ position: 'relative' }}
                                        onMouseEnter={() => setHoveredMessage(notification.notificationId)}
                                        onMouseLeave={() => setHoveredMessage(null)}
                                    >
                                        <Message size='small' color={notification.isRead ? undefined : "blue"}>
                                            {hoveredMessage === notification.notificationId && (
                                                <Dropdown
                                                    icon='ellipsis horizontal'
                                                    floating
                                                    button
                                                    className='icon notification-dropdown'
                                                    style={{ position: 'absolute', top: '17px', right: '10px' }}
                                                    basic
                                                >
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item
                                                            onClick={() => handleRemoveClick(notification.notificationId)}
                                                            text='Mark as Read'
                                                        />
                                                        <Dropdown.Item
                                                            onClick={() => handleReadClick(notification)}
                                                            text='Delete'
                                                        />
                                                        <Dropdown.Item text='Mute Notifications' />
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            )}
                                            <Message.Content>
                                                {notification.sourceUser.displayName + ' ' + notification.content}
                                                <div className="meta"> {/* Custom class for meta information */}
                                                    <span>{DateUtils1(notification.createdDate!)}</span>
                                                    {/* Dropdown for options, only visible when hovered */}
                                                </div>
                                            </Message.Content>
                                        </Message>
                                    </Segment>
                                ))}
                                {loading && (
                                    <Segment key='loading' size='small'>
                                        <NotificationPagePlaceholder />
                                        <NotificationPagePlaceholder />
                                        <NotificationPagePlaceholder />
                                        <NotificationPagePlaceholder />
                                    </Segment>
                                )}
                            </InfiniteScroll>
                        )}
                    </Segment.Group>
                </Grid.Column>
            </Grid>
        </Container>
    );
})


