import { observer } from "mobx-react-lite";
import { useRef } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Link } from "react-router-dom";
import { Dropdown, Message, Segment, Image, Label } from "semantic-ui-react";
import { DateUtils1 } from "../../../utils/dateUtils";
import { AppNotification } from "../../models/appNotification";
import { PagingParams } from "../../models/pagination";
import { router } from "../../router/Routes";
import { useStore } from "../../stores/Store";
import DropdownNotificationsPlaceholder from "./DropdownNotificationsPlaceholder";
import NotificationOptionsDropdown from "./NotificationOptionsDropdown";

interface Props {
    setIsOpen: (value: boolean) => void
    setunRead: (value: boolean) => void
    unRead: boolean
    canLoad: React.RefObject<boolean>;
}

export default observer(function RenderNotificationsDropdown({ setIsOpen, canLoad, setunRead, unRead }: Props) {

    const { notificationStore: { pagination, setPagingParams, setPagingParamsFunc, getNotifications, notifications, loading, resetNotifications } } = useStore();
    //const canLoad = useRef(false);
    const seeAllNotificationsButtonRef = useRef(null);

    function CanLoadMore(): boolean {
        return !!pagination && pagination.currentPage < pagination.totalPages;
    }

    const loadMore = () => {
        if (CanLoadMore() && canLoad.current && pagination) {
            //const pageNumber = (pagination) ? pagination.currentPage + 1 : 0;
            //setPagingParams(new PagingParams(pagination.currentPage + 1, 5));
            const _pagingParams = setPagingParamsFunc(new PagingParams(pagination.currentPage + 1, 5));
            //getNotifications(pagingParams, unRead);
            getNotifications(_pagingParams, unRead);
        }
    };

    //const handleMarkAllRead = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    //    e.preventDefault();
    //    e.stopPropagation();
    //    const hasUnreadNotifications = notifications?.some(notification => !notification.isRead);
    //    if (hasUnreadNotifications)
    //        markAsread();
    //}

    //const handleAllNotification = () => {
    //    const dropdown = document.querySelector('.notificationDropdown');
    //    //console.log('Dropdown:', dropdown); // Debugging statement
    //    if (dropdown) {
    //        dropdown.classList.remove('visible');
    //        //console.log('Dropdown hidden'); // Debugging statement
    //    }
    //    //resetNotifications();
    //}

    const handleItemClick = (notification: AppNotification) => {
        if (notification.activityId && notification.activityId !== ' ')
            router.navigate(`activities/${notification.activityId}`)
        setIsOpen(false);
    };

    const handleReadUnReadClick = (_unRead: boolean, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        setunRead(_unRead);
        e.preventDefault();
        e.stopPropagation();
        resetNotifications();
        setPagingParams(new PagingParams(1, 5));
        const _pagingParams = setPagingParamsFunc(new PagingParams(1, 5));
        getNotifications(_pagingParams, _unRead);
    }

    const renderNotifications = () => {
        if (notifications) {
            return notifications.map((notification, index) => (
                <Dropdown.Item
                    className='customDropdonwnPadding'
                    key={index}
                >
                    <Message floating>
                        <NotificationOptionsDropdown index={index} notification={notification} />
                        <div style={{ display: "flex", flexDirection: "column", fontWeight: 'bold' }}>
                            <Label
                                color={notification.isRead ? "teal" : "red"}
                                horizontal
                                pointing="below"
                                basic
                                style={{ marginRight: "15px" }}
                                as={Link}
                                to={(notification.activityId === '') ? `profiles/${notification.sourceUser.userName}` : `activities/${notification.activityId}`}
                                onClick={() => handleItemClick(notification)}
                            >
                                <Image avatar circular src={notification.sourceUser.image || "/assets/user.png"} />
                                <div style={{ whiteSpace: "pre-wrap", width: "250px" }}>{notification.sourceUser.displayName + ' ' + notification.content}</div>
                            </Label>
                            <span style={{ color: "gray", fontSize: "12px", margin: "auto" }}>{DateUtils1(notification.createdDate!)}</span>
                        </div>
                    </Message>
                </Dropdown.Item>
            ));
        }
    };

    return (
        <InfiniteScroll
            pageStart={1}
            loadMore={loadMore}
            hasMore={CanLoadMore()}
            initialLoad={false}
            useWindow={false}
            isReverse={false}
        >
            <Dropdown.Item>
                <Segment compact basic size='tiny'>
                    <Link
                        className="notification-link"
                        to=''
                        onClick={(e) => handleReadUnReadClick(true, e)}
                    >
                        Unread
                    </Link>
                    <Link
                        className="notification-link"
                        style={{ marginLeft: '5px' }}
                        to={'/notifications'}
                        onClick={(e) => handleReadUnReadClick(false, e)}
                        ref={seeAllNotificationsButtonRef}
                    >
                        All
                    </Link>
                </Segment>
            </Dropdown.Item>
            {renderNotifications()}
            {loading && ( // Display loading indicator at the bottom and center when loading more
                <DropdownNotificationsPlaceholder />
            )}
        </InfiniteScroll>
    )
})