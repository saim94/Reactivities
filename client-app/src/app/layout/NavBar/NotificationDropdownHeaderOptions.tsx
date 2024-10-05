import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Dropdown, Icon } from "semantic-ui-react";
import { router } from "../../router/Routes";
import { useStore } from "../../stores/Store";

export default observer(function NotificationDropdownHeaderOptions() {

    const [isOpen, setIsOpen] = useState(false);
    const { notificationStore } = useStore();

    const { notifications, markAsread } = notificationStore;

    const handleReadlAll = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(false);
        const hasUnreadNotifications = notifications?.some(notification => !notification.isRead);
        if (hasUnreadNotifications)
            markAsread();
    }

    const handleSeeAllNotification = () => {
        setIsOpen(false);
        router.navigate('/notifications')
    }

    const handleOnClose = (e: React.SyntheticEvent) => {
        setIsOpen(false)
        e.stopPropagation();
    }

    const handleOnClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <Dropdown
            open={isOpen}
            trigger={<span onClick={(e) => handleOnClick(e)} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: 'xx-large' }} >...</span>}
            icon={null}
            onOpen={() => setIsOpen(true)}
            onClose={(e) => handleOnClose(e)}
            onClick={(e) => handleOnClick(e)}
        >
            <Dropdown.Menu>
                <Dropdown.Item onClick={(e) => handleReadlAll(e)} ><Icon className='eye' /> Read All</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSeeAllNotification()} ><Icon className='book' /> See All Notifications</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
})