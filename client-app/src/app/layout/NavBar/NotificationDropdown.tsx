import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { Button, Dropdown, Label, Message, Header } from "semantic-ui-react";
import { PagingParams } from "../../models/pagination";
import { useStore } from "../../stores/Store";
import DropdownNotificationsPlaceholder from "./DropdownNotificationsPlaceholder";
import NotificationDropdownHeaderOptions from "./NotificationDropdownHeaderOptions";
import RenderNotificationsDropdown from "./RenderNotificationsDropdown";

export default observer(function NotificationDropdown() {

    const [isOpen, setIsOpen] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [unRead, setunRead] = useState(false);
    //const [event, setEvent] = useState<React.MouseEvent<HTMLElement, MouseEvent> | undefined>(undefined);
    const seeAllNotificationsButtonRef = useRef(null);

    const {
        notificationStore: { notifications, pagination, setPagingParamsFunc, getNotifications, loadingInitial, unreadNotificationsCount },
        commonStore: { notificationsPageOpen }
    } = useStore();

    const canLoad = useRef(false);

    const handleToggle = () => {
        if (!notificationsPageOpen)
            setIsOpen(!isOpen);
    };

    const handlePreviousNotificationButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        canLoad.current = true;
        setButtonClicked(true); // Set button clicked state to true
        e.stopPropagation(); // Prevent event propagation
        //const pageNumber = (pagination) ? pagination.currentPage + 1 : 0;
        let _pagingParams: PagingParams = new PagingParams(0, 5);
        if (pagination)
            _pagingParams = setPagingParamsFunc(new PagingParams(pagination.currentPage + 1, 5));
        //setPagingParams(new PagingParams(pagination.currentPage + 1, 5));
        getNotifications(_pagingParams, unRead);
        //getNotifications_V1(pagingParams, false, pageNumber);
    };

    const handleClickDropdownMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (e.target === seeAllNotificationsButtonRef.current) {
            return;
        }
        e.stopPropagation();
    }

    return (
        <Dropdown
            open={isOpen && !notificationsPageOpen}
            direction='left'
            pointing='top right'
            trigger={
                <div>
                    <Button basic icon="world" circular />
                    {notifications && notifications.length > 0 && unreadNotificationsCount > 0 && (
                        <Label circular color="red" floating>
                            {unreadNotificationsCount}
                        </Label>
                    )}
                </div>
            }
            icon={null}
            onOpen={handleToggle}
            onClose={handleToggle}
            compact
            basic
            scrolling
            className='notificationDropdown'
        >
            <Dropdown.Menu style={{ overflowY: "auto", maxHeight: "600px", minWidth: '250px !important' }} onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleClickDropdownMenu(e)}>
                <Dropdown.Header>
                    <Header size='large'>Notifications</Header>
                    {notifications && notifications.length > 0 && (
                        <span style={{ position: 'fixed', right: '30px', top: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <NotificationDropdownHeaderOptions />
                        </span>
                    )}
                </Dropdown.Header>
                {loadingInitial ? (
                    <>
                        <DropdownNotificationsPlaceholder />
                        <DropdownNotificationsPlaceholder />

                    </>
                ) : notifications && notifications.length === 0 ? (
                    <Dropdown.Item>
                        <Message floating>No notifications</Message>
                    </Dropdown.Item>
                ) : (
                    <RenderNotificationsDropdown setIsOpen={setIsOpen} canLoad={canLoad} unRead={unRead} setunRead={setunRead} />
                )}

                {!buttonClicked && notifications && notifications?.length > 0 && (
                    <Dropdown.Item>
                        <Button fluid basic onClick={(e) => handlePreviousNotificationButtonClick(e)}>Previous Notifications</Button>
                    </Dropdown.Item>
                )}
                <Dropdown.Divider />
            </Dropdown.Menu>
        </Dropdown>
    )
})